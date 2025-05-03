// models/Comment.js
module.exports = (sequelize, DataTypes) => {
    const Comment = sequelize.define('Comment', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      content: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      postId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Posts',
          key: 'id',
        },
      },
    });
  
    Comment.associate = (models) => {
      Comment.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });
  
      Comment.belongsTo(models.Post, {
        foreignKey: 'postId',
        as: 'post',
      });
    };
  
    return Comment;
  };
  