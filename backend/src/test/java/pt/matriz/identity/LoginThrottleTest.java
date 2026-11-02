package pt.matriz.identity;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class LoginThrottleTest {
    @Test
    void blocksAfterFiveFailuresAndClearsAfterSuccess() {
        LoginThrottle throttle = new LoginThrottle();

        for (int attempt = 0; attempt < 4; attempt++) {
            throttle.recordFailure("ana@example.invalid", "127.0.0.1");
            assertThat(throttle.retryAfterSeconds("ana@example.invalid", "127.0.0.1")).isZero();
        }
        throttle.recordFailure("ana@example.invalid", "127.0.0.1");
        assertThat(throttle.retryAfterSeconds("ana@example.invalid", "127.0.0.1")).isPositive();
        assertThat(throttle.retryAfterSeconds("other@example.invalid", "127.0.0.1")).isZero();

        throttle.recordSuccess("ana@example.invalid", "127.0.0.1");
        assertThat(throttle.retryAfterSeconds("ana@example.invalid", "127.0.0.1")).isZero();
    }
}
