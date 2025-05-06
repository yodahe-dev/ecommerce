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
        model: 'Users', // Ensure 'Users' is the correct table name
        key: 'id',
      },
      allowNull: true,
    },
    teamBoxId: {
      type: DataTypes.UUID,
      references: {
        model: 'TeamBoxes', // Ensure 'TeamBoxes' is the correct table name
        key: 'id',
      },
      allowNull: true,
    },
  });

  // Associations
  Post.associate = (models) => {
    Post.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'author',
    });

    Post.belongsTo(models.TeamBox, {
      foreignKey: 'teamBoxId',
      as: 'teamBox',
    });
  };

  return Post;
};
