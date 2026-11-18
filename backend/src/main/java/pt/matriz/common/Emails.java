package pt.matriz.common;

import java.util.Locale;

/** Existing local-email rules; callers own validation errors and HTTP decisions. */
public final class Emails {
    private Emails() {}

    public static String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    public static boolean valid(String normalized) {
        return normalized != null && !normalized.isBlank() && normalized.length() <= 254
                && normalized.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    }
}
