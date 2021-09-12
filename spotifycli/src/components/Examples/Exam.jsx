import Example from './Example'
import Example1 from './Example2'

const Exam = () => {
    return (
        <div>

            <div className='container container--fluid' style={{ margin: 0, minHeight: '100vh' }}>
                <Example />
            </div>
            <Example1/>
        </div>
    )
}
export default Exam