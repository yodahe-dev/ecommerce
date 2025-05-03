module.exports = (sequelize, DataTypes) => {
    const Post = sequelize.define('Post', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      userId: {
        type: DataTypes.UUID,
        references: {
          model: 'Users',
          key: 'id',
        },
        allowNull: true,
      },
      teamBoxId: {
        type: DataTypes.UUID,
        references: {
          model: 'TeamBoxes',
          key: 'id',
        },
        allowNull: true,
      },
      likesCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      favoritesCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      commentsCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    });
  
    Post.associate = (models) => {
      Post.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'author',
      });
  
      Post.belongsTo(models.TeamBox, {
        foreignKey: 'teamBoxId',
        as: 'teamBox',
      });
  
      Post.hasMany(models.Comment, {
        foreignKey: 'postId',
        as: 'comments',
      });
  
      Post.hasMany(models.Favorite, {
        foreignKey: 'postId',
        as: 'favorites',
      });
  
      Post.hasMany(models.Like, {
        foreignKey: 'postId',
        as: 'likes',
      });
    };
  
    return Post;
  };
  