package pt.matriz.projects;

import java.security.Principal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import pt.matriz.identity.IdentityService;
import static pt.matriz.common.ApiModels.*;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {
    private final ProjectService projects;
    private final IdentityService identities;

    public ProjectController(ProjectService projects, IdentityService identities) {
        this.projects = projects;
        this.identities = identities;
    }

    private String user(Principal principal) { return identities.current(principal).id(); }

    @GetMapping
    public ProjectPage list(Principal principal, @RequestParam(defaultValue = "") String search,
                            @RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "20") int pageSize) {
        return projects.list(user(principal), search, page, pageSize);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProjectView create(Principal principal, @RequestBody ProjectInput input) {
        return projects.create(user(principal), input);
    }

    @GetMapping("/{id}")
    public ProjectView get(Principal principal, @PathVariable String id) { return projects.get(id, user(principal)); }

    @PutMapping("/{id}")
    public ProjectView update(Principal principal, @PathVariable String id, @RequestBody ProjectInput input) {
        return projects.update(id, user(principal), input);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(Principal principal, @PathVariable String id, @RequestParam long version) {
        projects.delete(id, user(principal), version);
    }

    @GetMapping("/{id}/members")
    public List<MemberView> members(Principal principal, @PathVariable String id) { return projects.members(id, user(principal)); }

    @PostMapping("/{id}/members")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void add(Principal principal, @PathVariable String id, @RequestBody MemberInput input) {
        projects.addMember(id, user(principal), input);
    }

    @DeleteMapping("/{id}/members/{target}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(Principal principal, @PathVariable String id, @PathVariable String target) {
        projects.removeMember(id, user(principal), target);
    }
}
