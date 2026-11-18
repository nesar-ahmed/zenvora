from datetime import datetime
from enum import StrEnum
from uuid import uuid4

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.time import utcnow
from app.database.base import Base


class BusinessCategory(StrEnum):
    RESTAURANT = "restaurant"
    GROCERY = "grocery"
    RETAIL = "retail"
    OTHER = "other"


class BusinessStatus(StrEnum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    SUSPENDED = "suspended"


class Business(Base):
    __tablename__ = "businesses"
    __table_args__ = (
        CheckConstraint(
            "category IN ('restaurant', 'grocery', 'retail', 'other')",
            name="ck_businesses_category",
        ),
        CheckConstraint(
            "status IN ('pending', 'approved', 'rejected', 'suspended')",
            name="ck_businesses_status",
        ),
        CheckConstraint(
            "rating >= 0 AND rating <= 5",
            name="ck_businesses_rating",
        ),
        CheckConstraint(
            "delivery_fee_cents >= 0",
            name="ck_businesses_delivery_fee",
        ),
        CheckConstraint(
            "delivery_time_minutes > 0",
            name="ck_businesses_delivery_time",
        ),
        Index("ix_businesses_location", "country_code", "city"),
    )

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4()),
    )
    owner_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    slug: Mapped[str] = mapped_column(
        String(140),
        unique=True,
        index=True,
        nullable=False,
    )
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    category: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default=BusinessCategory.RESTAURANT.value,
        server_default=BusinessCategory.RESTAURANT.value,
    )
    status: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default=BusinessStatus.PENDING.value,
        server_default=BusinessStatus.PENDING.value,
        index=True,
    )
    address: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    country_code: Mapped[str] = mapped_column(
        String(2),
        nullable=False,
        default="IE",
        server_default="IE",
        index=True,
    )
    country_name: Mapped[str] = mapped_column(
        String(80),
        nullable=False,
        default="Ireland",
        server_default="Ireland",
    )
    city: Mapped[str] = mapped_column(
        String(80),
        nullable=False,
        default="Dublin",
        server_default="Dublin",
        index=True,
    )
    rating: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=4.5,
        server_default="4.5",
    )
    delivery_fee_cents: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default="0",
    )
    delivery_time_minutes: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=30,
        server_default="30",
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="1",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utcnow,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utcnow,
        onupdate=utcnow,
        server_default=func.now(),
    )
