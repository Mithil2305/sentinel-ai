from typing import Dict, Any, Optional
import math

class YaraScanner:
    """
    YARA signature and entropy scanner for suspicious payload inspection.
    """
    def calculate_shannon_entropy(self, data: bytes) -> float:
        if not data:
            return 0.0
        entropy = 0.0
        length = len(data)
        occurrence = [0] * 256
        for byte in data:
            occurrence[byte] += 1
        for count in occurrence:
            if count == 0:
                continue
            p = count / length
            entropy -= p * math.log2(p)
        return round(entropy, 2)

    def scan_file_buffer(self, filename: str, content: bytes) -> Dict[str, Any]:
        entropy = self.calculate_shannon_entropy(content)
        is_high_entropy = entropy > 7.5
        
        signatures_matched = []
        if b"stratum+tcp://" in content or b"xmrig" in content.lower():
            signatures_matched.append("crypto_miner_signature")
        if b"YOUR FILES HAVE BEEN ENCRYPTED" in content or b".locked" in filename.encode():
            signatures_matched.append("ransomware_note_signature")
            
        return {
            "filename": filename,
            "entropy": entropy,
            "is_encrypted_anomaly": is_high_entropy,
            "signatures_matched": signatures_matched,
            "has_threat_match": len(signatures_matched) > 0 or is_high_entropy
        }

yara_scanner = YaraScanner()
