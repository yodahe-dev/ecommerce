module.exports = (sequelize, DataTypes) => {
  const Like = sequelize.define('Like', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users', // Ensure the Users model is properly defined
        key: 'id',
      },
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Products', // Ensure the Products model is properly defined
        key: 'id',
      },
    },
  }, {
    timestamps: true,
  });

  Like.associate = (models) => {
    Like.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
    Like.belongsTo(models.Product, {
      foreignKey: 'productId',
      as: 'product',
    });
  };

  return Like;
};
