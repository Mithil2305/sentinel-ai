from typing import Dict, Any
from detection_engine.mitre.mapping import get_mitre_details

class MitreAttackMapper:
    """
    Enriches detected security events with MITRE ATT&CK tactics, techniques, and descriptions.
    """
    def enrich_event(self, threat_match: Dict[str, Any]) -> Dict[str, Any]:
        """
        Takes a threat match dict with 'technique' (e.g. "T1110 - Brute Force")
        and injects full MITRE ATT&CK information.
        """
        technique_str = threat_match.get("technique", "T1204 - User Execution")
        technique_id = technique_str.split(" ")[0] if " " in technique_str else technique_str
        
        mitre_details = get_mitre_details(technique_id)
        
        enriched = {
            **threat_match,
            "mitre_id": technique_id,
            "mitre_name": mitre_details.get("name", "Generic Threat Pattern"),
            "mitre_tactic": mitre_details.get("tactic", "Execution"),
            "mitre_description": mitre_details.get("description", ""),
            "default_remediation": mitre_details.get("default_remediation", "Analyst Review Required")
        }
        return enriched

mitre_mapper = MitreAttackMapper()
