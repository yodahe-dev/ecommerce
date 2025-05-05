// models/Member.js
module.exports = (sequelize, DataTypes) => {
  const Member = sequelize.define('Member', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    teamBoxId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'TeamBoxes',
        key: 'id',
      },
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

  Member.associate = (models) => {
    // A Member belongs to one TeamBox
    Member.belongsTo(models.TeamBox, {
      foreignKey: 'teamBoxId',
      as: 'teamBox',
    });

    // A Member belongs to one User
    Member.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  };

  return Member;
};
