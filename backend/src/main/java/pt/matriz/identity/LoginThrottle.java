package pt.matriz.identity;

import java.time.Clock;
import java.time.Duration;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class LoginThrottle {
    private static final int MAX_FAILURES = 5;
    private static final Duration WINDOW = Duration.ofMinutes(15);
    private static final Duration BLOCK = Duration.ofMinutes(15);
    private final Clock clock = Clock.systemUTC();
    private final Map<String, Entry> attempts = new HashMap<>();

    public synchronized long retryAfterSeconds(String email, String address) {
        Entry entry = attempts.get(key(email, address));
        long now = clock.millis();
        return entry != null && entry.blockedUntil > now
                ? (entry.blockedUntil - now + 999) / 1000 : 0;
    }

    public synchronized void recordFailure(String email, String address) {
        long now = clock.millis();
        attempts.entrySet().removeIf(entry ->
                now - entry.getValue().firstFailureAt > WINDOW.toMillis()
                        && now >= entry.getValue().blockedUntil);
        String key = key(email, address);
        Entry entry = attempts.get(key);
        if (entry == null || now - entry.firstFailureAt > WINDOW.toMillis()) {
            attempts.put(key, new Entry(1, now, 0));
            return;
        }
        entry.failures++;
        if (entry.failures >= MAX_FAILURES) entry.blockedUntil = now + BLOCK.toMillis();
    }

    public synchronized void recordSuccess(String email, String address) {
        attempts.remove(key(email, address));
    }

    private String key(String email, String address) {
        return email.trim().toLowerCase(Locale.ROOT) + "|" + address;
    }

    private static final class Entry {
        private int failures;
        private final long firstFailureAt;
        private long blockedUntil;

        private Entry(int failures, long firstFailureAt, long blockedUntil) {
            this.failures = failures;
            this.firstFailureAt = firstFailureAt;
            this.blockedUntil = blockedUntil;
        }
    }
}
