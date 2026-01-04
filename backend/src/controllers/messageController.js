import {
  emitNewMessage,
} from "../utils/messageHelper.js";
import query from '../libs/db.js';
import { getUserById, createMessage, getMessagesByProduct, getProductExistsById } from '../libs/sqlQuery.js';
import { io } from "../socket/index.js";

class MessageController {
  async sendMessage(req, res, next) {
    try {
      const { recipientId, content, productId, image } = req.body;
      const senderId = req.user?.id;

      if (!senderId) {
        return res.status(401).json({ message: "Unauthorized - User ID not found" });
      }

      // Validate required fields
      if (!content && !image) {
        return res.status(400).json({ message: "Message content or image is required!!" });
      }

      // Determine message type based on content and image
      let messageType;
      if (content && image) {
        messageType = 'text_and_image';
      } else if (content) {
        messageType = 'text';
      } else {
        messageType = 'image';
      }

      // Check if product exists
      const product = await query(getProductExistsById, [productId]); 
      if (!product || product.rows.length === 0) {
        return res.status(404).json({ message: "The product that you buy is not existed!!" });
      }

      // Create message in database
      const message = await query(createMessage, [
        productId,
        senderId,
        content || null,
        image || null,
        messageType,
      ]);

      if (!message || message.rows.length === 0) {
        return res.status(403).json({ message: "Error when create message!!" });
      }

      const messageData = message.rows[0];

      // Emit message to all users in the product room
      emitNewMessage(io, product.rows[0], messageData);

      return res
        .status(200)
        .json({ message: "Send message successfully!!", data: messageData });
    } catch (error) {
      console.error("Error when sending message!", error);
      return res.status(500).json({ message: "Internal server error!!" });
    }
  }

  async getMessages(req, res, next) {
    try {
      const { productId } = req.params;
      const { limit = 20, offset = 0 } = req.query;
      // Validate productId
      if (!productId) {
        return res.status(400).json({ message: "Product ID is required!!" });
      }
      
      // Check if product exists
      const product = await query(getProductExistsById, [productId]);
      if (!product || product.rows.length === 0) {
        return res.status(404).json({ message: "Product not found!!" });
      }

      // Get messages
      const messagesResult = await query(getMessagesByProduct(), [productId, limit, offset]);
      const messages = messagesResult.rows;

      return res.status(200).json({
        message: "Get messages successfully!!",
        data: messages,
        total: messages.length,
      });
    } catch (error) {
      console.error("Error when getting messages!", error);
      return res.status(500).json({ message: "Internal server error!!" });
    }
  }
}

const messageController = new MessageController();
export default messageController;
