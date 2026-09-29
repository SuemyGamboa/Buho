export function fetchSubjects() {
  return fetch('/api/subjects', { headers: { Accept: 'application/json' } })
    .then((response) => {
      if (!response.ok) {
        throw new Error('No fue posible cargar las materias disponibles.');
      }
      return response.json();
    });
}
