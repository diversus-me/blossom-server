export default function defineAPI(app, models) {

    app.get('/allFlowers', (req, res) => {
        res.json({
          name: 'Dandelion',
          colour: 'Blue-ish'
        })
      })
}