// models/Chat.js
module.exports = (sequelize, DataTypes) => {
    const Chat = sequelize.define('Chat', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      message: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      senderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      receiverId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
    });
  
    Chat.associate = (models) => {
      Chat.belongsTo(models.User, {
        foreignKey: 'senderId',
        as: 'sender',
      });
  
      Chat.belongsTo(models.User, {
        foreignKey: 'receiverId',
        as: 'receiver',
      });
    };
  
    return Chat;
  };
  