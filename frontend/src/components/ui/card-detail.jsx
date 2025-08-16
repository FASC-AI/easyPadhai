import {
    Table,
    TableBody,
    TableRow,
} from "@/components/ui/table"
import Typography from '@/components/ui/typography';

const CardDetail = ({ title, content }) => {
    return (
        <div>
            <div className='border border-gray-300 rounded-md'>
                <Table >

                    <TableBody >
                        <>
                            <Typography variant="h3" affects="large" className='px-4 pt-3'> {title}</Typography>

                            {content.map((data) => (
                                <TableRow key={data.data} className='border-gray-300 '>
                                    <div className='w-100 font-medium px-4 py-3'>
                                        <Typography variant="p" affects="muted">
                                            {data?.label}
                                        </Typography>
                                        <p>
                                            {data?.value ? data?.value : '--'}
                                        </p>
                                    </div>
                                </TableRow>
                            ))}
                        </>
                    </TableBody>
                </Table>
            </div></div>
    )
}

export default CardDetail