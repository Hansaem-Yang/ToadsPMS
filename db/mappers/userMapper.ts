import { query } from '../index';

export const UserMapper = {
  findAll: async () => query('select * from [user]'),
  findById: async (id: string) =>
    query('select * from [user] where email = @id', [{ name: 'id', value: id }]),
};