package pt.matriz.tasks;

import java.nio.charset.StandardCharsets;
import java.security.Principal;
import java.util.List;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import pt.matriz.identity.IdentityService;
import static pt.matriz.common.ApiModels.*;

@RestController
@RequestMapping("/api/projects/{projectId}/tasks/{id}/attachments")
public class TaskAttachmentController {
    private final TaskAttachmentService attachments;
    private final IdentityService identities;

    public TaskAttachmentController(TaskAttachmentService attachments, IdentityService identities) {
        this.attachments = attachments;
        this.identities = identities;
    }

    private String user(Principal principal) { return identities.current(principal).id(); }

    @GetMapping
    public AttachmentList list(Principal principal, @PathVariable String projectId, @PathVariable String id) {
        return attachments.list(projectId, id, user(principal));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public AttachmentList upload(Principal principal, @PathVariable String projectId, @PathVariable String id,
                                 @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        return attachments.upload(projectId, id, user(principal), files);
    }

    @GetMapping("/{attachmentId}")
    public ResponseEntity<byte[]> download(Principal principal, @PathVariable String projectId, @PathVariable String id,
                                            @PathVariable String attachmentId) {
        TaskAttachmentService.Download file = attachments.download(projectId, id, attachmentId, user(principal));
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(file.metadata().contentType()))
                .contentLength(file.metadata().sizeBytes())
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                        .filename(file.metadata().filename(), StandardCharsets.UTF_8).build().toString())
                .header("X-Content-Type-Options", "nosniff").header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(file.bytes());
    }

    @DeleteMapping("/{attachmentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(Principal principal, @PathVariable String projectId, @PathVariable String id,
                        @PathVariable String attachmentId) {
        attachments.delete(projectId, id, attachmentId, user(principal));
    }
}
