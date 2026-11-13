package pt.matriz.tasks;

import java.security.Principal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.*;
import pt.matriz.identity.IdentityService;
import static pt.matriz.common.ApiModels.*;

@RestController
@RequestMapping("/api/projects/{projectId}/tasks")
public class TaskController {
    private final TaskService tasks;
    private final IdentityService identities;
    private final TaskLinkService links;
    private final TaskActivityService activity;

    public TaskController(TaskService tasks, IdentityService identities, TaskLinkService links, TaskActivityService activity) {
        this.tasks = tasks;
        this.identities = identities;
        this.links = links;
        this.activity = activity;
    }

    private String user(Principal principal) { return identities.current(principal).id(); }

    @GetMapping
    public TaskPage list(Principal principal, @PathVariable String projectId,
                         @RequestParam(required = false) String status, @RequestParam(required = false) String priority,
                         @RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "20") int pageSize) {
        return tasks.list(projectId, user(principal), status, priority, page, pageSize);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TaskView create(Principal principal, @PathVariable String projectId, @RequestBody CreateTask input) {
        return tasks.create(projectId, user(principal), input);
    }

    @GetMapping("/{id}")
    public TaskView get(Principal principal, @PathVariable String projectId, @PathVariable String id) {
        return tasks.get(projectId, id, user(principal));
    }

    @PutMapping("/{id}")
    public TaskView update(Principal principal, @PathVariable String projectId, @PathVariable String id,
                           @RequestBody UpdateTask input) {
        return tasks.update(projectId, id, user(principal), input);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(Principal principal, @PathVariable String projectId, @PathVariable String id, @RequestParam long version) {
        tasks.delete(projectId, id, user(principal), version);
    }

    @PutMapping("/{id}/assignments/{target}")
    public TaskView assign(Principal principal, @PathVariable String projectId, @PathVariable String id,
                           @PathVariable String target, @RequestBody VersionInput input) {
        return tasks.assign(projectId, id, user(principal), target, input.version(), false);
    }

    @DeleteMapping("/{id}/assignments/{target}")
    public TaskView unassign(Principal principal, @PathVariable String projectId, @PathVariable String id,
                             @PathVariable String target, @RequestParam long version) {
        return tasks.assign(projectId, id, user(principal), target, version, true);
    }

    @GetMapping("/{id}/comments")
    public CommentPage comments(Principal principal, @PathVariable String projectId, @PathVariable String id,
                                @RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "20") int pageSize) {
        return tasks.comments(projectId, id, user(principal), page, pageSize);
    }

    @PostMapping(value = "/{id}/comments", consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public CommentView comment(Principal principal, @PathVariable String projectId, @PathVariable String id,
                               @RequestBody CommentInput input) {
        return tasks.comment(projectId, id, user(principal), input.content());
    }

    @PostMapping(value = "/{id}/comments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public CommentView commentFiles(Principal principal, @PathVariable String projectId, @PathVariable String id,
                                    @RequestPart("comment") CommentInput input,
                                    @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        return tasks.comment(projectId, id, user(principal), input.content(), files);
    }

    @GetMapping("/{id}/links")
    public LinkPage links(Principal principal, @PathVariable String projectId, @PathVariable String id,
                           @RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "20") int pageSize) {
        return links.list(projectId, id, user(principal), page, pageSize);
    }

    @PostMapping("/{id}/links")
    public ResponseEntity<LinkMutation> link(Principal principal, @PathVariable String projectId, @PathVariable String id,
                                             @RequestBody LinkInput input) {
        TaskLinkService.Created result = links.create(projectId, id, user(principal), input);
        return ResponseEntity.status(result.created() ? HttpStatus.CREATED : HttpStatus.OK).body(result.result());
    }

    @DeleteMapping("/{id}/links/{linkId}")
    public LinkDeletion unlink(Principal principal, @PathVariable String projectId, @PathVariable String id,
                               @PathVariable String linkId, @RequestParam Long version, @RequestParam Long targetVersion) {
        return links.delete(projectId, id, linkId, user(principal), version, targetVersion);
    }

    @GetMapping("/{id}/activity")
    public ActivityPage activity(Principal principal, @PathVariable String projectId, @PathVariable String id,
                                 @RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "20") int pageSize) {
        return activity.list(projectId, id, user(principal), page, pageSize);
    }
}
