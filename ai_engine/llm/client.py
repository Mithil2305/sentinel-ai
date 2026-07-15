import re
import json
import httpx
import logging
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger("sentinel.ai.llm")

class UnifiedLLMClient:
    """
    Multi-model routing LLM client supporting:
    - Phi-4-mini (Quantized): Fast Triage & Severity classification.
    - Qwen2.5-Coder (Quantized): Forensic query generation & Mitigation script synthesis.
    - Cloud APIs (Google Gemini / OpenAI).
    """

    def sanitize_prompt(self, text: str) -> str:
        """
        STRIDE Information Disclosure protection:
        Mask passwords, root keys, and sensitive environment vars before processing.
        """
        sanitized = re.sub(r'password["\s:=]+[^\s,"]+', 'password="[REDACTED]"', text, flags=re.IGNORECASE)
        sanitized = re.sub(r'SECRET_KEY=[^\s]+', 'SECRET_KEY="[REDACTED]"', sanitized)
        return sanitized

    async def invoke_model(self, prompt: str, model_role: str = "triage") -> str:
        sanitized_prompt = self.sanitize_prompt(prompt)
        provider = settings.LLM_PROVIDER.lower()

        # Select model based on agent role
        if model_role in ["triage", "severity"]:
            target_model = settings.MODEL_TRIAGE_SEVERITY
        else:
            target_model = settings.MODEL_FORENSICS_MITIGATION

        if provider == "local":
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.post(
                        f"{settings.LOCAL_LLM_BASE_URL}/chat/completions",
                        json={
                            "model": target_model,
                            "messages": [{"role": "user", "content": sanitized_prompt}],
                            "temperature": 0.2
                        }
                    )
                    if response.status_code == 200:
                        res_json = response.json()
                        return res_json["choices"][0]["message"]["content"]
            except Exception as e:
                logger.warning(f"Local LLM ({target_model}) endpoint unreachable: {e}. Falling back to rule-based fallback reasoning.")

        elif provider == "gemini" and settings.GEMINI_API_KEY:
            try:
                from langchain_google_genai import ChatGoogleGenerativeAI
                llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=settings.GEMINI_API_KEY)
                res = await llm.ainvoke(sanitized_prompt)
                return str(res.content)
            except Exception as e:
                logger.warning(f"Gemini API error: {e}. Falling back to default SOC analyst reasoning.")

        # Heuristic fallback reasoning engine
        return self._rule_based_fallback(sanitized_prompt, model_role)

    def _rule_based_fallback(self, prompt: str, model_role: str) -> str:
        prompt_lower = prompt.lower()
        if "ssh" in prompt_lower or "brute" in prompt_lower:
            return json.dumps({
                "severity": "LOW",
                "score": 3.8,
                "mitre_technique": "T1110 - Brute Force",
                "findings": "Multiple SSH authentication failures detected from external IP 198.51.100.45.",
                "action": "iptables -A INPUT -s 198.51.100.45 -j DROP",
                "risk_explanation": "Low risk automated firewall block."
            })
        elif "miner" in prompt_lower or "xmrig" in prompt_lower or "tmp" in prompt_lower:
            return json.dumps({
                "severity": "MEDIUM",
                "score": 6.5,
                "mitre_technique": "T1204 - User Execution",
                "findings": "Unauthorized cryptominer execution detected in /tmp/xmrig. High CPU consumption.",
                "action": "kill -9 32145 && mv /tmp/xmrig /var/security/quarantine/ && chmod 000 /var/security/quarantine/xmrig",
                "risk_explanation": "Medium risk termination of unauthorized miner binary."
            })
        elif "privilege" in prompt_lower or "root" in prompt_lower or "dirty_pipe" in prompt_lower:
            return json.dumps({
                "severity": "HIGH",
                "score": 8.4,
                "mitre_technique": "T1548 - Abuse Elevation Control",
                "findings": "Unauthorized user elevated to EUID=0 without sudo binary record.",
                "action": "pkill -u guest_user && passwd -l guest_user",
                "risk_explanation": "High impact account locking required. Requires analyst validation."
            })
        elif "entropy" in prompt_lower or "locked" in prompt_lower or "encrypt" in prompt_lower:
            return json.dumps({
                "severity": "CRITICAL",
                "score": 9.8,
                "mitre_technique": "T1486 - Data Encrypted for Impact",
                "findings": "Ransomware encryption activity detected. Information entropy: 7.99 (High density).",
                "action": "kill -STOP 9482",
                "risk_explanation": "Critical threat. Process suspended immediately; rollback snapshot pending approval."
            })
        
        return json.dumps({
            "severity": "MEDIUM",
            "score": 5.0,
            "mitre_technique": "T1204 - User Execution",
            "findings": "Anomalous system process execution.",
            "action": "pkill -f anomaly_process",
            "risk_explanation": "Standard process mitigation."
        })

llm_client = UnifiedLLMClient()
