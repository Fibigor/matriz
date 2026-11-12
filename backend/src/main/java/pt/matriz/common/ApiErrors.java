package pt.matriz.common;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URI;
import java.util.List;
import java.util.Map;
import tools.jackson.core.exc.JacksonIOException;
import tools.jackson.databind.json.JsonMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class ApiErrors {
    private static final Logger LOG = LoggerFactory.getLogger(ApiErrors.class);

    @ExceptionHandler(ApiException.class)
    ProblemDetail expected(ApiException error) {
        ProblemDetail problem = problem(error.status(), error.getMessage());
        if (error.field() != null) {
            problem.setProperty("errors", List.of(Map.of("field", error.field(), "message", error.getMessage())));
        }
        return problem;
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class,
            MissingServletRequestParameterException.class})
    ProblemDetail malformed(Exception error) {
        return problem(400, "Formato do pedido inválido.");
    }

    @ExceptionHandler(DataAccessException.class)
    ProblemDetail database(DataAccessException error) {
        // SQL and parameters can contain user content: log only the failure category.
        LOG.error("Database operation failed: {}", error.getClass().getSimpleName());
        return problem(503, "Não foi possível concluir a operação.");
    }

    private static ProblemDetail problem(int status, String detail) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.valueOf(status), detail);
        // Framework 7 leaves this null; the existing API requires an explicit type.
        problem.setType(URI.create("about:blank"));
        return problem;
    }

    public static void write(HttpServletResponse response, JsonMapper mapper, int status, String detail) throws IOException {
        response.setStatus(status);
        response.setContentType("application/problem+json");
        try {
            mapper.writeValue(response.getOutputStream(), problem(status, detail));
        } catch (JacksonIOException error) {
            // Jackson 3 wraps transport IO failures in an unchecked exception.
            // Preserve the servlet/security handler's IOException contract.
            throw error.getCause();
        }
    }
}
