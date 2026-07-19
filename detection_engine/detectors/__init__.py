from detection_engine.detectors.brute_force import brute_force_detector
from detection_engine.detectors.malware import malware_detector
from detection_engine.detectors.privilege_escalation import privilege_escalation_detector
from detection_engine.detectors.file_tampering import file_tampering_detector
from detection_engine.detectors.anomaly import anomaly_detector

ALL_DETECTORS = [
    brute_force_detector,
    malware_detector,
    privilege_escalation_detector,
    file_tampering_detector,
    anomaly_detector
]

def evaluate_normalized_log(normalized_log: dict) -> dict or None:
    for detector in ALL_DETECTORS:
        res = detector.detect(normalized_log)
        if res:
            return res
    return None
