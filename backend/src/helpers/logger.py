# src/helpers/logger.py
import logging
import os


def get_logger():
    logger = logging.getLogger("travel_planner")
    logger.setLevel(logging.INFO)

    if not logger.handlers:
        formatter = logging.Formatter("%(asctime)s | %(levelname)s | %(message)s")

        console = logging.StreamHandler()
        console.setFormatter(formatter)

        os.makedirs("logs", exist_ok=True)
        file = logging.FileHandler("logs/app.log")
        file.setFormatter(formatter)

        logger.addHandler(console)
        logger.addHandler(file)

    return logger
