package pt.matriz.identity;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

class RegistrationThrottleTest {
    private static final class TestClock extends Clock {
        private Instant now = Instant.parse("2026-11-17T12:00:00Z");
        void advanceMillis(long millis) { now = now.plusMillis(millis); }
        @Override public ZoneId getZone() { return ZoneOffset.UTC; }
        @Override public Clock withZone(ZoneId zone) { return this; }
        @Override public Instant instant() { return now; }
    }

    @Test
    void countsFivePerAddressAndRoundsRetryWithoutExtendingWindow() {
        TestClock clock = new TestClock();
        RegistrationThrottle throttle = new RegistrationThrottle(clock);
        for (int i = 0; i < 5; i++) assertThat(throttle.acquire("one")).isZero();
        assertThat(throttle.acquire("one")).isEqualTo(900);
        assertThat(throttle.acquire("two")).isZero();
        clock.advanceMillis(1);
        assertThat(throttle.acquire("one")).isEqualTo(900);
        clock.advanceMillis(899_000);
        assertThat(throttle.acquire("one")).isEqualTo(1);
        clock.advanceMillis(999);
        assertThat(throttle.acquire("one")).isZero();
        assertThat(new RegistrationThrottle(clock).acquire("one")).isZero();
    }

    @Test
    void expiresEachAttemptIndependentlyAtTheExactSlidingBoundary() {
        TestClock clock = new TestClock();
        RegistrationThrottle throttle = new RegistrationThrottle(clock);
        assertThat(throttle.acquire("one")).isZero();
        clock.advanceMillis(1000);
        for (int i = 0; i < 4; i++) assertThat(throttle.acquire("one")).isZero();
        clock.advanceMillis(899_000);
        assertThat(throttle.acquire("one")).isZero();
        assertThat(throttle.acquire("one")).isEqualTo(1);
        clock.advanceMillis(1000);
        for (int i = 0; i < 4; i++) assertThat(throttle.acquire("one")).isZero();
        assertThat(throttle.acquire("one")).isEqualTo(899);
    }

    @Test
    void concurrentRequestsCannotExceedFiveAdmissions() throws Exception {
        RegistrationThrottle throttle = new RegistrationThrottle(new TestClock());
        try (var pool = Executors.newFixedThreadPool(10)) {
            var tasks = new java.util.ArrayList<java.util.concurrent.Callable<Long>>();
            for (int i = 0; i < 20; i++) tasks.add(() -> throttle.acquire("same"));
            int admitted = 0;
            for (var result : pool.invokeAll(tasks)) {
                if (result.get(10, TimeUnit.SECONDS) == 0) admitted++;
            }
            assertThat(admitted).isEqualTo(5);
        }
    }
}
