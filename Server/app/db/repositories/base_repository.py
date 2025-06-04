from __future__ import annotations

from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union

from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import Base

ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)


class BaseRepository(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    """A generic repository providing CRUD helpers for SQLAlchemy models."""

    def __init__(self, model: Type[ModelType]):
        self.model = model

    # ---------------------------------------------------------------------
    # Read operations
    # ---------------------------------------------------------------------

    def get(self, db: Session, id: Any) -> Optional[ModelType]:  # noqa: A002
        """Return a single record by primary key or *None*."""

        return db.query(self.model).filter(self.model.id == id).first()

    def get_multi(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[ModelType]:
        """Return `limit` records, offset by `skip`."""

        return db.query(self.model).offset(skip).limit(limit).all()

    # ---------------------------------------------------------------------
    # Write operations
    # ---------------------------------------------------------------------

    def create(self, db: Session, *, obj_in: CreateSchemaType) -> ModelType:
        """Insert a new record from a Pydantic schema instance."""

        obj_in_data = dict(obj_in)
        db_obj = self.model(**obj_in_data)  # type: ignore[arg-type]
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: ModelType,
        obj_in: Union[UpdateSchemaType, Dict[str, Any]],
    ) -> ModelType:
        """Apply partial updates to an existing DB object."""

        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = dict(obj_in)

        for field, value in update_data.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)

        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: int) -> ModelType:  # noqa: A002
        """Delete a record by primary key and return it."""

        obj = db.query(self.model).get(id)  # type: ignore[arg-type]
        db.delete(obj)
        db.commit()
        return obj
