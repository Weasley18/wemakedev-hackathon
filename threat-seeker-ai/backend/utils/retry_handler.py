import time
import logging
import asyncio
import random
from typing import Callable, Any, TypeVar, Optional, Dict

# Create a type variable for the return type of the function
T = TypeVar('T')

# Setup logger
logger = logging.getLogger(__name__)

class GeminiRateLimitError(Exception):
    """Exception raised for Gemini API rate limit errors."""
    
    def __init__(self, message: str, retry_delay: int = 20):
        self.message = message
        self.retry_delay = retry_delay
        super().__init__(self.message)


def is_rate_limit_error(error: Exception) -> tuple[bool, Optional[int]]:
    """
    Check if the exception is a Gemini API rate limit error.
    
    Args:
        error: The exception to check
        
    Returns:
        tuple: (is_rate_limit, retry_delay_seconds)
    """
    error_str = str(error).lower()
    
    # Check for common rate limit error patterns in the error message
    if any(phrase in error_str for phrase in ["quota", "rate limit", "resource exhausted"]):
        # Try to extract retry_delay from the error message
        retry_delay = 20  # Default value
        
        # Look for retry_delay in the error message
        if "retry_delay" in error_str:
            try:
                # Extract seconds value from something like "retry_delay { seconds: 20 }"
                import re
                match = re.search(r"retry_delay\s*{\s*seconds:\s*(\d+)\s*}", error_str)
                if match:
                    retry_delay = int(match.group(1))
            except Exception:
                pass  # Keep default if extraction fails
        
        return True, retry_delay
    
    return False, None


async def async_retry_with_exponential_backoff(
    func: Callable[..., Any],
    *args: Any,
    max_retries: int = 5,
    initial_delay: Optional[int] = None,
    max_delay: int = 600,  # 10 minutes maximum delay
    backoff_factor: float = 2.0,
    jitter: bool = True,
    **kwargs: Any
) -> T:
    """
    Retry an async function with exponential backoff when rate limit errors occur.
    
    Args:
        func: The async function to retry
        *args: Positional arguments to pass to the function
        max_retries: Maximum number of retries before giving up
        initial_delay: Initial delay in seconds before retrying (will be overridden by API's suggested delay if available)
        max_delay: Maximum delay in seconds between retries
        backoff_factor: Factor by which the delay increases with each retry
        jitter: Whether to add random jitter to the delay to prevent thundering herd problem
        **kwargs: Keyword arguments to pass to the function
        
    Returns:
        The result of the function call
        
    Raises:
        The last exception encountered after max_retries
    """
    # Default initial delay
    delay = initial_delay or 1
    last_exception = None
    
    # Try up to max_retries times
    for attempt in range(max_retries + 1):
        try:
            return await func(*args, **kwargs)
        except Exception as e:
            last_exception = e
            
            # Check if this is a rate limit error
            is_rate_limit, api_delay = is_rate_limit_error(e)
            
            # If it's the last attempt or not a rate limit error, raise the exception
            if attempt == max_retries or not is_rate_limit:
                raise
            
            # Use API's suggested delay if available, otherwise use calculated delay
            if api_delay is not None:
                delay = api_delay
            else:
                delay = min(max_delay, delay * backoff_factor)
            
            # Add jitter if enabled (±15%)
            if jitter:
                delay = delay * (1 + random.uniform(-0.15, 0.15))
            
            logger.warning(
                f"Gemini API rate limit hit. Retrying in {delay:.1f}s. "
                f"Attempt {attempt + 1}/{max_retries}. Error: {str(e)}"
            )
            
            # Wait before retrying
            await asyncio.sleep(delay)
    
    # We should never get here due to the raise in the loop, but just in case
    if last_exception:
        raise last_exception
    raise RuntimeError("Unknown error in retry mechanism")


def retry_with_exponential_backoff(
    func: Callable[..., Any],
    *args: Any,
    max_retries: int = 5,
    initial_delay: Optional[int] = None,
    max_delay: int = 600,  # 10 minutes maximum delay
    backoff_factor: float = 2.0,
    jitter: bool = True,
    **kwargs: Any
) -> T:
    """
    Retry a synchronous function with exponential backoff when rate limit errors occur.
    
    Args:
        func: The function to retry
        *args: Positional arguments to pass to the function
        max_retries: Maximum number of retries before giving up
        initial_delay: Initial delay in seconds before retrying (will be overridden by API's suggested delay if available)
        max_delay: Maximum delay in seconds between retries
        backoff_factor: Factor by which the delay increases with each retry
        jitter: Whether to add random jitter to the delay to prevent thundering herd problem
        **kwargs: Keyword arguments to pass to the function
        
    Returns:
        The result of the function call
        
    Raises:
        The last exception encountered after max_retries
    """
    # Default initial delay
    delay = initial_delay or 1
    last_exception = None
    
    # Try up to max_retries times
    for attempt in range(max_retries + 1):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            last_exception = e
            
            # Check if this is a rate limit error
            is_rate_limit, api_delay = is_rate_limit_error(e)
            
            # If it's the last attempt or not a rate limit error, raise the exception
            if attempt == max_retries or not is_rate_limit:
                raise
            
            # Use API's suggested delay if available, otherwise use calculated delay
            if api_delay is not None:
                delay = api_delay
            else:
                delay = min(max_delay, delay * backoff_factor)
            
            # Add jitter if enabled (±15%)
            if jitter:
                delay = delay * (1 + random.uniform(-0.15, 0.15))
            
            logger.warning(
                f"Gemini API rate limit hit. Retrying in {delay:.1f}s. "
                f"Attempt {attempt + 1}/{max_retries}. Error: {str(e)}"
            )
            
            # Wait before retrying
            time.sleep(delay)
    
    # We should never get here due to the raise in the loop, but just in case
    if last_exception:
        raise last_exception
    raise RuntimeError("Unknown error in retry mechanism")
