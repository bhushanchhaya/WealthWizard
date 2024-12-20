from app import app, logger

if __name__ == "__main__":
    try:
        logger.info("Starting the Financial Calculator server on port 5000")
        app.run(host="0.0.0.0", port=5000, debug=True)
    except Exception as e:
        logger.error(f"Failed to start server: {str(e)}")
        raise
