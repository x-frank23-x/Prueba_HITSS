from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session
from datetime import datetime
from models import alarms as models
from config.db import get_db
from schemas.alarms import ImportResponse, AlarmResponse,DailySummaryResponse, AlarmCreate
from services.alarmClassifier import classifyAlarm
from services.csvParser import readAlamarCsv
from services.servicesSummary import getSummaryToday


router = APIRouter(prefix="/api/alarms", tags=["Alarms"])


@router.post("/import", response_model=ImportResponse)
async def importAlarms(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Debe subir un archivo csv")

    content = await file.read()

    try:
        rows = readAlamarCsv(content)
    except Exception as a:
        raise HTTPException(status_code=400, detail="Error al leer el archivo: " + str(a))

    db.query(models.Alarm).delete()

    savedAlarms = []

    for row in rows:
        classification = classifyAlarm(
            dateCreate=row["dateCreate"],
            tec2g=row["tec2g"],
            tec3g=row["tec3g"],
            tec4g=row["tec4g"],
            noti=row["noti"],
        )

        newAlarm = models.Alarm(
            idAlarm=row["idAlarm"],
            tec2g=row["tec2g"],
            tec3g=row["tec3g"],
            tec4g=row["tec4g"],
            dateCreate=row["dateCreate"],
            muni=row["muni"],
            depa=row["depa"],
            noti=row["noti"],
            timeHours=int(classification["durationHours"]),
            timeText=classification["durationText"],
            critical=classification["criticality"],
        )

        db.add(newAlarm)
        savedAlarms.append(newAlarm)

    db.commit()

    return {
        "fileName": file.filename,
        "totalProcessed": len(savedAlarms),
        "items": savedAlarms,
    }
    

@router.get("/", response_model=list[AlarmResponse])
def listAlarms(criticality: str = None, db: Session = Depends(get_db)):
    if criticality:
        alarms = (
            db.query(models.Alarm)
            .filter(models.Alarm.critical == criticality.upper())
            .all()
        )
    else:
        alarms = db.query(models.Alarm).all()

    return alarms


@router.get("/summary/today", response_model=DailySummaryResponse)
def summaryDay(db: Session = Depends(get_db)):

    alarms = [
        {"dateCreate": datetime.now().replace(hour=8, minute=15)},
        {"dateCreate": datetime.now().replace(hour=8, minute=30)},
        {"dateCreate": datetime.now().replace(hour=14, minute=10)},
        {"dateCreate": datetime.now().replace(hour=14, minute=20)},
        {"dateCreate": datetime.now().replace(hour=14, minute=45)},
        {"dateCreate": None}
    ]

    print("Total de alarmas:", len(alarms))

    for index, alarm in enumerate(alarms):
        print(
            "ID:", index + 1,
            "Fecha:", alarm["dateCreate"],
            "Tipo:", type(alarm["dateCreate"])
        )

    resumen = getSummaryToday(alarms)

    print("Resumen:", resumen)

    return resumen

@router.post("/", response_model=AlarmResponse)
def createAlarm(alarm: AlarmCreate, db: Session = Depends(get_db)):

    classification = classifyAlarm(
        dateCreate=alarm.dateCreate,
        tec2g=alarm.tec2g,
        tec3g=alarm.tec3g,
        tec4g=alarm.tec4g,
        noti=alarm.noti
    )

    newAlarm = models.Alarm(
        idAlarm=alarm.idAlarm,
        tec2g=alarm.tec2g,
        tec3g=alarm.tec3g,
        tec4g=alarm.tec4g,
        dateCreate=alarm.dateCreate,
        muni=alarm.muni,
        depa=alarm.depa,
        noti=alarm.noti,
        timeHours=int(classification["durationHours"]),
        timeText=classification["durationText"],
        critical=classification["criticality"]
    )

    db.add(newAlarm)
    db.commit()
    db.refresh(newAlarm)

    return newAlarm