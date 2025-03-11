from typing import Any, Dict, Optional

api_key: str = ""

class Completion:
    @staticmethod
    def create(
        model: str,
        prompt: str,
        max_tokens: Optional[int] = None,
        **kwargs: Any
    ) -> Dict[str, Any]: ...

class Model:
    @staticmethod
    def create(
        name: str,
        prompt: str,
        **kwargs: Any
    ) -> Dict[str, Any]: ... 