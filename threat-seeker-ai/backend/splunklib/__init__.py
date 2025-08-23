"""
Mock module for splunk-sdk to prevent import errors during deployment
"""

# Create a mock six.moves submodule
class _SixMoves:
    def map(self, *args, **kwargs):
        return list(map(*args, **kwargs))

class _Six:
    def __init__(self):
        self.moves = _SixMoves()

# Create the required module structure
six = _Six()
