class CreateUserTours < ActiveRecord::Migration[7.1]
  def change
    create_table :user_tours do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.string :tour_key, null: false
      t.string :status, null: false, default: 'completed'
      t.datetime :completed_at
      t.timestamps
    end
    add_index :user_tours, [:user_id, :tour_key], unique: true
  end
end
