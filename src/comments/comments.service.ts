import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Comment, CommentDocument } from '../db/schemas/comment.schema'

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private model: Model<CommentDocument>
  ) {}

  async createComment(
    userId: string,
    materialId: string,
    content: string,
    isInstructor: boolean = false,
    parentId?: string
  ) {
    const comment = new this.model({
      userId: new Types.ObjectId(userId),
      materialId: new Types.ObjectId(materialId),
      content,
      isInstructor,
      ...(parentId && { parentId: new Types.ObjectId(parentId) })
    })
    
    return comment.save()
  }

  async getCommentsByMaterial(materialId: string) {
    return this.model.find({
      materialId: new Types.ObjectId(materialId),
      parentId: { $exists: false } // Solo comentarios principales, no respuestas
    })
    .sort({ createdAt: -1 })
    .populate('userId', 'name email avatar')
    .lean()
  }

  async getReplies(commentId: string) {
    return this.model.find({
      parentId: new Types.ObjectId(commentId)
    })
    .sort({ createdAt: 1 })
    .populate('userId', 'name email avatar')
    .lean()
  }

  async likeComment(commentId: string, userId: string) {
    return this.model.findOneAndUpdate(
      { 
        _id: new Types.ObjectId(commentId),
        likedBy: { $ne: new Types.ObjectId(userId) }
      },
      { 
        $inc: { likes: 1 },
        $push: { likedBy: new Types.ObjectId(userId) }
      },
      { new: true }
    )
  }

  async unlikeComment(commentId: string, userId: string) {
    return this.model.findOneAndUpdate(
      { 
        _id: new Types.ObjectId(commentId),
        likedBy: new Types.ObjectId(userId)
      },
      { 
        $inc: { likes: -1 },
        $pull: { likedBy: new Types.ObjectId(userId) }
      },
      { new: true }
    )
  }

  async deleteComment(commentId: string, userId: string, isAdmin: boolean = false) {
    const query: any = {
      _id: new Types.ObjectId(commentId)
    }
    
    // Si no es admin, solo puede borrar sus propios comentarios
    if (!isAdmin) {
      query.userId = new Types.ObjectId(userId)
    }
    
    return this.model.findOneAndDelete(query)
  }
}
