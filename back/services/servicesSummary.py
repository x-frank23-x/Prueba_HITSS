
from datetime import date, datetime


def getSummaryToday(alarms: list) -> dict:

    today = date.today()
    countsByHour = {f"{h:02d}:00": 0 for h in range(24)}
    totalDay = 0

    for item in alarms:

        # Obtenemos la fecha dependiendo de como llegue el registro
        if isinstance(item, dict):
            dt = item.get("dateCreate")
        elif hasattr(item, "dateCreate"):
            dt = item.dateCreate
        else:
            dt = item

        # Validamos que la fecha sea correcta
        if dt is None or not isinstance(dt, datetime):
            continue

        # Comparamos la fecha de creacion con la fecha actual
        if dt.date() == today:

            totalDay += 1

            # Obtenemos la hora y sumamos la cantidad de alarmas
            hourKey = f"{dt.hour:02d}:00"
            countsByHour[hourKey] += 1

    # Organizamos las horas que tienen alarmas
    perHour = [
        {"hour": hour, "amount": amount}
        for hour, amount in countsByHour.items()
        if amount > 0
    ]

    return {
        "date": today.isoformat(),
        "totalDay": totalDay,
        "perHour": perHour
    }
