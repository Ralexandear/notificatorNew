function myFunction() {
  const promise = new Promise((resolve, reject) => {
    console.log(1)
    resolve(); // Завершаем промис
  })

  promise.then(() => {
    console.log(3); // Выполнится после завершения промиса
  });

  console.log(2);
}

myFunction();