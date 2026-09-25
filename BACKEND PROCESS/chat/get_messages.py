from database.connection import SessionLocal
from database.models import ChatMessage


def get_messages(
    session_id
):
    db = SessionLocal()
    try:
        messages = db.query(
            ChatMessage
        ).filter(
            ChatMessage.session_id == session_id
        ).order_by(
            ChatMessage.id.asc()
        ).all()

        result = []
        for msg in messages:
            result.append({
                "id": msg.id,
                "sender": msg.sender,
                "text": msg.message,
                "created_at": str(msg.created_at) if msg.created_at else None
            })

        return result
    finally:
        db.close()