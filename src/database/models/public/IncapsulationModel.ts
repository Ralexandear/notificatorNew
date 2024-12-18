export abstract class IncapsulationModel<TModel extends object> {
  protected constructor(protected model: TModel) {}

  // Метод для сохранения изменений в модели
  save(): Promise<void> {
    if ('save' in this.model && typeof (this.model as any).save === 'function') {
      return (this.model as any).save();
    }
    throw new Error('The model does not implement a save method');
  }


}
