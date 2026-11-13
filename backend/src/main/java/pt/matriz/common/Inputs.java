package pt.matriz.common;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Set;
import static pt.matriz.common.ApiModels.*;

public final class Inputs {
    private Inputs() {}

    public static String title(String value, int max, String field) {
        if (value == null) throw invalid(field, "Campo obrigatório.");
        String normalized = trim(value);
        if (normalized.isEmpty() || normalized.codePointCount(0, normalized.length()) > max) {
            throw invalid(field, "Use entre 1 e " + max + " caracteres, sem contar espaços nas extremidades.");
        }
        return normalized;
    }

    public static String description(String value) {
        String result = value == null ? "" : value;
        if (result.codePointCount(0, result.length()) > 2000) throw invalid("description", "Máximo de 2 000 caracteres.");
        return result;
    }

    public static String choice(String value, Set<String> choices, String field) {
        if (value == null || !choices.contains(value)) throw invalid(field, "Valor inválido.");
        return value;
    }

    public static long version(Long value) {
        return version(value, "version");
    }

    public static long version(Long value, String field) {
        if (value == null || value < 1) throw invalid(field, "É necessária a versão atual.");
        return value;
    }

    public static Integer weight(Integer value) {
        if (value != null && !Set.of(1, 2, 3, 5, 8, 13).contains(value)) throw invalid("weight", "Peso inválido.");
        return value;
    }

    public static void page(int page, int size) {
        if (page < 1 || size < 1 || size > 100) throw new ApiException(400, "Paginação inválida.");
    }

    public static long offset(int page, int size) { return ((long) page - 1) * size; }

    public static Pagination pagination(int page, int size, long total) {
        return new Pagination(page, size, total, (total + size - 1) / size);
    }

    public static Progress progress(long todo, long doing, long done) {
        long total = todo + doing + done;
        int percent = total == 0 ? 0 : BigDecimal.valueOf(done).multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(total), 0, RoundingMode.HALF_UP).intValueExact();
        return new Progress(total, todo, doing, done, percent);
    }

    public static ApiException invalid(String field, String message) { return new ApiException(422, message, field); }

    private static boolean whitespace(int point) {
        return Character.isWhitespace(point) || Character.isSpaceChar(point) || point == 0x85;
    }

    private static String trim(String value) {
        int start = 0, end = value.length();
        while (start < end && whitespace(value.codePointAt(start))) start += Character.charCount(value.codePointAt(start));
        while (end > start && whitespace(value.codePointBefore(end))) end -= Character.charCount(value.codePointBefore(end));
        return value.substring(start, end);
    }
}
