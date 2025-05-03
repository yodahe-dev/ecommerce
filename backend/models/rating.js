module.exports = (sequelize, DataTypes) => {
    const Rating = sequelize.define('Rating', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      raterId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      rateableId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      rateableType: {
        type: DataTypes.STRING, // 'User' or 'TeamBox'
        allowNull: false,
      },
      score: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          min: 0,
          max(value) {
            if (this.isAdmin) {
              if (value > 10) throw new Error('Max 10 for admin');
            } else {
              if (value > 5.1) throw new Error('Max 5.1 for users');
            }
          },
        },
      },
      isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    });
  
    Rating.associate = (models) => {
      Rating.belongsTo(models.User, {
        foreignKey: 'raterId',
        as: 'rater',
      });
    };
  
    return Rating;
  };
  