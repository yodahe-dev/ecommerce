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
        unique: true,
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
    });
  
    return TeamBox;
  };
  