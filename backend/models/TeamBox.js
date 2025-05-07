// models/TeamBox.js
module.exports = (sequelize, DataTypes) => {
  const TeamBox = sequelize.define('TeamBox', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    bio: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
  });

  // Associations
  TeamBox.associate = (models) => {
    TeamBox.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'author',
    });
  };

  return TeamBox;
};
