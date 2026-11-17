package pt.matriz.identity;

import java.time.Clock;
import java.time.Duration;
import java.util.ArrayDeque;
import java.util.HashMap;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class RegistrationThrottle {
    private static final int LIMIT = 5;
    private static final long WINDOW_MILLIS = Duration.ofMinutes(15).toMillis();
    private final Clock clock;
    private final Map<String, ArrayDeque<Long>> attempts = new HashMap<>();

    public RegistrationThrottle() { this(Clock.systemUTC()); }

    RegistrationThrottle(Clock clock) { this.clock = clock; }

    /** Atomically consumes an attempt, or returns the rounded-up wait in seconds. */
    public synchronized long acquire(String address) {
        long now = clock.millis();
        attempts.values().forEach(times -> {
            while (!times.isEmpty() && times.peekFirst() <= now - WINDOW_MILLIS) times.removeFirst();
        });
        attempts.values().removeIf(ArrayDeque::isEmpty);
        ArrayDeque<Long> times = attempts.computeIfAbsent(address, ignored -> new ArrayDeque<>());
        if (times.size() >= LIMIT) return (times.peekFirst() + WINDOW_MILLIS - now + 999) / 1000;
        times.addLast(now);
        return 0;
    }
}
