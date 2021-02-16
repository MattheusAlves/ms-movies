import ReactLoading from 'react-loading'

const LoadingCard = (): JSX.Element => {
  return (
    <div className="card-loading">
      <ReactLoading type="spinningBubbles" color="#4B45FF" />
    </div>
  )
}

export default LoadingCard
