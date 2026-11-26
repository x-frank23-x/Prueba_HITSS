from datetime import datetime


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
) -> dict:
    now = datetime.now()
    difference = now - dateCreate
    secondsElapsed = difference.total_seconds()

    if secondsElapsed < 0:
        secondsElapsed = 0

    hoursElapsed = round(secondsElapsed / 3600, 2)
    durationText = calculateTextDuration(secondsElapsed)

    techAvailable = tec2g >= 0 and tec3g >= 0 and tec4g >= 0

    atLimit = tec2g == 100 or tec3g == 100 or tec4g == 100

    # 3. Notificación negativa ("N")
    notNotified = noti.strip().upper() == "N"

    criticality = "NORMAL"

    if techAvailable and atLimit and notNotified:
        if hoursElapsed > 24:
            criticality = "CRITICAL"
        elif hoursElapsed > 1:
            criticality = "WARN"

    return {
        "durationHours": hoursElapsed,
        "durationText": durationText,
        "criticality": criticality,
    }