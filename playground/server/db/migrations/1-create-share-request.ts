import {QueryInterface, DataTypes, Sequelize} from 'sequelize'

module.exports = {
  up: async (queryInterface: QueryInterface, _) => {
    await queryInterface.createTable('shareRequest', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: Sequelize.fn('uuid_generate_v4'),
      },
      requestedTypes: {
        allowNull: false,
        type: DataTypes.ARRAY(DataTypes.STRING()),
      },
      sharedTypes: {
        allowNull: true,
        type: DataTypes.ARRAY(DataTypes.STRING()),
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
    })
  },

  down: async (queryInterface, _) => {
    await queryInterface.dropTable('shareRequest')
  },
}
