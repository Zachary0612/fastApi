from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import User, FamilyRelation
from app.schemas import FamilyBindRequest, FamilyRelationOut, UserOut
from app.auth import get_current_user

router = APIRouter(prefix="/api/family", tags=["家庭协同"])


@router.post("/bind")
def bind_elderly(data: FamilyBindRequest, db: Session = Depends(get_db),
                 current_user: User = Depends(get_current_user)):
    """家属绑定老人账户"""
    if current_user.role != "family":
        raise HTTPException(status_code=403, detail="只有家属角色可以绑定老人")

    elderly = db.query(User).filter(User.username == data.elderly_username).first()
    if not elderly:
        raise HTTPException(status_code=404, detail="未找到该老人账户")
    if elderly.role != "elderly":
        raise HTTPException(status_code=400, detail="目标用户不是老人角色")

    existing = db.query(FamilyRelation).filter(
        FamilyRelation.family_user_id == current_user.id,
        FamilyRelation.elderly_user_id == elderly.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="已绑定该老人")

    relation = FamilyRelation(
        family_user_id=current_user.id,
        elderly_user_id=elderly.id,
        relation_name=data.relation_name,
    )
    db.add(relation)
    db.commit()
    db.refresh(relation)

    return {"message": "绑定成功", "relation_id": relation.id}


@router.get("/my-elderly", response_model=List[UserOut])
def get_my_elderly(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """家属查看绑定的老人列表"""
    relations = db.query(FamilyRelation).filter(
        FamilyRelation.family_user_id == current_user.id
    ).all()
    elderly_ids = [r.elderly_user_id for r in relations]
    if not elderly_ids:
        return []
    return db.query(User).filter(User.id.in_(elderly_ids)).all()


@router.get("/my-family", response_model=List[UserOut])
def get_my_family(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """老人查看绑定的家属列表"""
    relations = db.query(FamilyRelation).filter(
        FamilyRelation.elderly_user_id == current_user.id
    ).all()
    family_ids = [r.family_user_id for r in relations]
    if not family_ids:
        return []
    return db.query(User).filter(User.id.in_(family_ids)).all()


@router.delete("/unbind/{elderly_id}")
def unbind_elderly(elderly_id: int, db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):
    """解绑老人"""
    relation = db.query(FamilyRelation).filter(
        FamilyRelation.family_user_id == current_user.id,
        FamilyRelation.elderly_user_id == elderly_id
    ).first()
    if not relation:
        raise HTTPException(status_code=404, detail="未找到绑定关系")
    db.delete(relation)
    db.commit()
    return {"message": "解绑成功"}
