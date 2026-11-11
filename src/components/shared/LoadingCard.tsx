import Spinner from './Spinner'

const LoadingCard = (): React.JSX.Element => {
  return (
    <div className="card-loading">
      <Spinner />
    </div>
  )
}

export default LoadingCard
