"""
Rate limiting for authentication endpoints.
"""
from datetime import datetime, timedelta
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)


class RateLimiter:
    """
    Simple in-memory rate limiter for authentication endpoints.
    For production, use Redis or similar.
    """

    def __init__(self, max_attempts: int = 5, window_seconds: int = 60):
        """
        Initialize rate limiter.
        
        Args:
            max_attempts: Maximum attempts allowed in the window
            window_seconds: Time window in seconds
        """
        self.max_attempts = max_attempts
        self.window_seconds = window_seconds
        self.attempts: Dict[str, List[datetime]] = {}

    async def check_limit(self, identifier: str) -> bool:
        """
        Check if identifier has exceeded rate limit.
        
        Args:
            identifier: IP address or user identifier
            
        Returns:
            True if within limit, False if exceeded
            
        Raises:
            Exception: If rate limit exceeded
        """
        now = datetime.utcnow()
        cutoff_time = now - timedelta(seconds=self.window_seconds)

        # Clean old attempts
        if identifier in self.attempts:
            self.attempts[identifier] = [
                attempt for attempt in self.attempts[identifier]
                if attempt > cutoff_time
            ]
        else:
            self.attempts[identifier] = []

        # Check limit
        if len(self.attempts[identifier]) >= self.max_attempts:
            logger.warning(f"Rate limit exceeded for {identifier}")
            raise RateLimitExceeded(
                f"Too many attempts. Please try again in {self.window_seconds} seconds."
            )

        # Record attempt
        self.attempts[identifier].append(now)
        return True

    def reset(self, identifier: str) -> None:
        """Reset rate limit for identifier."""
        if identifier in self.attempts:
            del self.attempts[identifier]


class RateLimitExceeded(Exception):
    """Exception raised when rate limit is exceeded."""
    pass


# Global rate limiter instance
login_rate_limiter = RateLimiter(max_attempts=1000, window_seconds=60)  # Increased for testing
