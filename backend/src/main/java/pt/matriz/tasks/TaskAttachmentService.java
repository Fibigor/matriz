package pt.matriz.tasks;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.CodingErrorAction;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import pt.matriz.common.ApiException;
import pt.matriz.common.Inputs;
import pt.matriz.projects.ProjectService;
import static pt.matriz.common.ApiModels.*;

@Service
public class TaskAttachmentService {
    static final int MAX_BYTES = 4 * 1024 * 1024;
    private static final Map<String, Set<String>> FORMATS = Map.of(
            "image/png", Set.of("png"), "image/jpeg", Set.of("jpg", "jpeg"),
            "image/gif", Set.of("gif"), "image/webp", Set.of("webp"),
            "application/pdf", Set.of("pdf"), "text/plain", Set.of("txt"), "text/markdown", Set.of("md", "markdown"));
    private final JdbcTemplate db;
    private final ProjectService projects;
    private final TaskActivityService activity;

    public TaskAttachmentService(JdbcTemplate db, ProjectService projects, TaskActivityService activity) {
        this.db = db;
        this.projects = projects;
        this.activity = activity;
    }

    @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
    public AttachmentList list(String project, String task, String user) {
        access(project, task, user, false);
        return new AttachmentList(metadata(task, null, user));
    }

    List<TaskAttachmentView> forComment(String task, String comment, String user) { return metadata(task, comment, user); }

    private List<TaskAttachmentView> metadata(String task, String comment, String user) {
        return db.query("""
                SELECT a.id,a.task_id,a.comment_id,a.filename,a.content_type,a.size_bytes,a.author_id,a.created_at,
                u.display_name,p.owner_user_id FROM task_attachment a
                JOIN app_user u ON u.id=a.author_id JOIN task t ON t.id=a.task_id JOIN project p ON p.id=t.project_id
                WHERE a.task_id=? AND a.comment_id IS NOT DISTINCT FROM CAST(? AS varchar)
                ORDER BY a.created_at,a.id
                """, (rs, row) -> new TaskAttachmentView(rs.getString("id"), task, rs.getString("comment_id"),
                rs.getString("filename"), rs.getString("content_type"), rs.getLong("size_bytes"),
                new UserView(rs.getString("author_id"), rs.getString("display_name")), rs.getTimestamp("created_at").toInstant(),
                user.equals(rs.getString("author_id")) || user.equals(rs.getString("owner_user_id"))), task, comment);
    }

    @Transactional
    public AttachmentList upload(String project, String task, String user, List<MultipartFile> files) {
        access(project, task, user, true);
        if (files == null || files.isEmpty()) throw Inputs.invalid("files", "Envie entre 1 e 5 ficheiros.");
        return new AttachmentList(store(task, null, user, files));
    }

    private record Validated(String filename, String mime, byte[] bytes) {}

    // Caller holds the existing project row lock. Validate the entire batch before storing anything.
    @Transactional(propagation = Propagation.MANDATORY)
    public List<TaskAttachmentView> store(String task, String comment, String user, List<MultipartFile> files) {
        List<MultipartFile> batch = files == null ? List.of() : files;
        long count = db.queryForObject("""
                SELECT count(*) FROM task_attachment WHERE task_id=? AND comment_id IS NOT DISTINCT FROM CAST(? AS varchar)
                """, Long.class, task, comment);
        if (batch.size() > 5 || count + batch.size() > 5) throw Inputs.invalid("files", "Máximo de 5 anexos por tarefa ou comentário.");
        List<Validated> validated = new ArrayList<>();
        for (MultipartFile file : batch) validated.add(validate(file));
        List<String> ids = new ArrayList<>();
        for (Validated file : validated) {
            String id = UUID.randomUUID().toString();
            ids.add(id);
            db.update("""
                    INSERT INTO task_attachment(id,task_id,comment_id,filename,content_type,size_bytes,data,author_id)
                    VALUES (?,?,?,?,?,?,?,?)
                    """, id, task, comment, file.filename(), file.mime(), file.bytes().length, file.bytes(), user);
            if (comment == null) activity.add(task, user, ActivityType.ATTACHMENT_ADDED,
                    new TaskActivityService.Payload(List.of(), false, false, null, null,
                            new AttachmentActivity(id, file.filename(), file.mime(), file.bytes().length)));
        }
        return metadata(task, comment, user).stream().filter(a -> ids.contains(a.id())).toList();
    }

    public record Download(TaskAttachmentView metadata, byte[] bytes) {}

    @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
    public Download download(String project, String task, String id, String user) {
        access(project, task, user, false);
        TaskAttachmentView item = find(task, id, user);
        byte[] bytes = db.queryForObject("SELECT data FROM task_attachment WHERE id=? AND task_id=?", byte[].class, id, task);
        return new Download(item, bytes);
    }

    @Transactional
    public void delete(String project, String task, String id, String user) {
        access(project, task, user, true);
        TaskAttachmentView item = find(task, id, user);
        if (!item.canDelete()) throw new ApiException(403, "Só o autor ou gestor pode remover este anexo.");
        db.update("DELETE FROM task_attachment WHERE id=? AND task_id=?", id, task);
        activity.add(task, user, ActivityType.ATTACHMENT_REMOVED,
                new TaskActivityService.Payload(List.of(), false, false, item.commentId(), null,
                        new AttachmentActivity(id, item.filename(), item.contentType(), item.sizeBytes())));
    }

    private TaskAttachmentView find(String task, String id, String user) {
        List<String> comments = db.query("SELECT comment_id FROM task_attachment WHERE task_id=? AND id=?",
                (rs, row) -> rs.getString("comment_id"), task, id);
        if (comments.isEmpty()) throw ApiException.notFound();
        return metadata(task, comments.getFirst(), user).stream().filter(a -> a.id().equals(id))
                .findFirst().orElseThrow(ApiException::notFound);
    }

    private void access(String project, String task, String user, boolean lock) {
        if (lock) TaskService.lockProject(projects, db, project, user, false);
        else projects.access(project, user, false, false);
        if (!Boolean.TRUE.equals(db.queryForObject("SELECT EXISTS(SELECT 1 FROM task WHERE id=? AND project_id=?)",
                Boolean.class, task, project))) throw ApiException.notFound();
    }

    private static Validated validate(MultipartFile file) {
        if (file.getSize() > MAX_BYTES) throw new ApiException(413, "Ficheiro excede 4 MiB.", "files");
        if (file.isEmpty()) throw Inputs.invalid("files", "Ficheiro vazio.");
        String filename = filename(file.getOriginalFilename());
        int dot = filename.lastIndexOf('.');
        String extension = dot < 0 ? "" : filename.substring(dot + 1).toLowerCase(Locale.ROOT);
        String declared = file.getContentType();
        String mime = declared == null ? "" : declared.split(";", 2)[0].strip().toLowerCase(Locale.ROOT);
        if (!FORMATS.containsKey(mime) || !FORMATS.get(mime).contains(extension)) throw badFormat();
        byte[] bytes;
        try { bytes = file.getBytes(); }
        catch (IOException error) { throw new ApiException(400, "Não foi possível ler o ficheiro.", "files"); }
        if (bytes.length > MAX_BYTES) throw new ApiException(413, "Ficheiro excede 4 MiB.", "files");
        boolean valid = switch (mime) {
            case "image/png" -> starts(bytes, new byte[]{(byte)137,80,78,71,13,10,26,10});
            case "image/jpeg" -> bytes.length >= 5 && starts(bytes, new byte[]{(byte)255,(byte)216,(byte)255})
                    && bytes[bytes.length-2] == (byte)255 && bytes[bytes.length-1] == (byte)217;
            case "image/gif" -> (ascii(bytes, 0, "GIF87a") || ascii(bytes, 0, "GIF89a")) && bytes.length >= 14
                    && bytes[bytes.length-1] == 0x3b;
            case "image/webp" -> webp(bytes);
            // Header/trailer validation only, NOT full PDF structural validation or malware protection.
            case "application/pdf" -> pdf(bytes);
            case "text/plain", "text/markdown" -> text(bytes);
            default -> false;
        };
        if (!valid) throw badFormat();
        return new Validated(filename, mime, bytes);
    }

    private static ApiException badFormat() { return Inputs.invalid("files", "Formato, extensão ou conteúdo do ficheiro inválido."); }

    private static String filename(String original) {
        String name = Normalizer.normalize(original == null ? "" : original.replace('\\', '/'), Normalizer.Form.NFC);
        name = name.substring(name.lastIndexOf('/') + 1);
        StringBuilder safe = new StringBuilder();
        name.codePoints().filter(c -> !Character.isISOControl(c) && Character.getType(c) != Character.FORMAT)
                .forEach(safe::appendCodePoint);
        name = safe.toString().strip();
        if (name.isBlank() || name.equals(".") || name.equals("..")) throw Inputs.invalid("files", "Nome de ficheiro inválido.");
        if (name.codePointCount(0, name.length()) > 255) {
            int dot = name.lastIndexOf('.');
            String suffix = dot >= 0 ? name.substring(dot) : "";
            int suffixLength = suffix.codePointCount(0, suffix.length());
            if (suffixLength > 20) throw badFormat();
            name = name.substring(0, name.offsetByCodePoints(0, 255 - suffixLength)) + suffix;
        }
        return name;
    }

    private static boolean starts(byte[] bytes, byte[] magic) {
        if (bytes.length < magic.length) return false;
        for (int i = 0; i < magic.length; i++) if (bytes[i] != magic[i]) return false;
        return true;
    }

    private static boolean ascii(byte[] bytes, int offset, String value) {
        if (offset < 0 || bytes.length - offset < value.length()) return false;
        for (int i = 0; i < value.length(); i++) if (bytes[offset+i] != value.charAt(i)) return false;
        return true;
    }

    private static boolean pdf(byte[] bytes) {
        if (bytes.length < 14 || !ascii(bytes, 0, "%PDF-") || bytes[5] < '1' || bytes[5] > '2'
                || bytes[6] != '.' || bytes[7] < '0' || bytes[7] > '9') return false;
        int end = bytes.length;
        while (end > 0 && (bytes[end-1] == ' ' || bytes[end-1] == '\r' || bytes[end-1] == '\n' || bytes[end-1] == '\t')) end--;
        return ascii(bytes, end-5, "%%EOF");
    }

    private static boolean webp(byte[] bytes) {
        if (bytes.length < 20 || !ascii(bytes, 0, "RIFF") || !ascii(bytes, 8, "WEBP")) return false;
        ByteBuffer data = ByteBuffer.wrap(bytes).order(ByteOrder.LITTLE_ENDIAN);
        if (Integer.toUnsignedLong(data.getInt(4)) != bytes.length - 8L) return false;
        long offset = 12;
        boolean image = false;
        while (offset + 8 <= bytes.length) {
            int start = (int) offset;
            long length = Integer.toUnsignedLong(data.getInt(start+4));
            if (length == 0 || offset + 8 + length + (length & 1) > bytes.length) return false;
            if (ascii(bytes, start, "VP8X") && length != 10) return false;
            if (ascii(bytes, start, "VP8 ")) {
                if (length < 10 || bytes[start+11] != (byte)0x9d || bytes[start+12] != 1 || bytes[start+13] != 0x2a) return false;
                image = true;
            }
            if (ascii(bytes, start, "VP8L")) {
                if (length < 5 || bytes[start+8] != 0x2f) return false;
                image = true;
            }
            if (ascii(bytes, start, "ANMF")) {
                if (length < 24) return false;
                image = true;
            }
            offset += 8 + length + (length & 1);
        }
        return image && offset == bytes.length;
    }

    private static boolean text(byte[] bytes) {
        try {
            String value = StandardCharsets.UTF_8.newDecoder().onMalformedInput(CodingErrorAction.REPORT)
                    .onUnmappableCharacter(CodingErrorAction.REPORT).decode(ByteBuffer.wrap(bytes)).toString();
            if (value.indexOf('\0') >= 0) return false;
            String lower = value.toLowerCase(Locale.ROOT);
            return !java.util.regex.Pattern.compile("<\\s*(?:!doctype\\b|\\?xml\\b|/?[a-z][a-z0-9:-]*(?:\\s|/?>))")
                    .matcher(lower).find();
        } catch (CharacterCodingException error) { return false; }
    }
}
