module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
        id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
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
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastPrice: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
  }, {
    timestamps: true,
  });

  Product.associate = (models) => {
    Product.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  };

  return Product;
};
