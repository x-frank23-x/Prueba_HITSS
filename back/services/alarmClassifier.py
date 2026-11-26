from datetime import datetime
from typing import Optional

def calculateTextDuration(seconds: float) -> str:
    if seconds < 0:
        seconds = 0

    totalSeconds = int(seconds)
    hours = totalSeconds // 3600
    minutes = (totalSeconds % 3600) // 60
    return f"{hours}h {minutes}m"


def classifyAlarm(
    dateCreate: datetime,
    tec2g: int,
    tec3g: int,
    tec4g: int,
    noti: str,
    now: Optional[datetime] = None,
) -> dict:
    now = now or datetime.now()
    secondsElapsed = max((now - dateCreate).total_seconds(), 0)
    hoursElapsed = secondsElapsed / 3600

  
    available = [v for v in (tec2g, tec3g, tec4g) if v >= 0]
    
    atLimit = len(available) > 0 and all(v == 100 for v in available)
    
    notNotified = noti.strip().upper() == "N"

    criticality = "NORMAL"
    if atLimit and notNotified:
        if hoursElapsed > 24:
            criticality = "CRITICAL"
        elif hoursElapsed > 1:
            criticality = "WARN"

    return {
        "durationHours": round(hoursElapsed, 2),
        "durationText": calculateTextDuration(secondsElapsed),
        "criticality": criticality,
    }