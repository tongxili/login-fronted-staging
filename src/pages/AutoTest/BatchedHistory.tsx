import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  Typography,
  message,
  Input,
  Card,
  Table,
  Checkbox,
  Image,
  Modal,
  DatePicker,
  Descriptions,
} from 'antd';
import { StarFilled, StarOutlined } from '@ant-design/icons';
import {
  ArrowLeftOutlined,
  SearchOutlined,
  ReloadOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
// import {HistoryPage} from './History';
import { tryonApi, TestHistoryItem, TestHistoryQuery, TestHistoryBatch } from '../../api/tryon';
import { TestResult } from './Results';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Custom styles
const customModalStyles = `
  .custom-preview-modal .ant-modal-close {
    top: -5px !important;
    right: -5px !important;
  }
  .custom-preview-modal .ant-modal-close-x {
    width: 32px !important;
    height: 32px !important;
    line-height: 32px !important;
    font-size: 18px !important;
  }
`;

// Add custom styles to the document head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = customModalStyles;
  document.head.appendChild(styleElement);
}

// table props for batched history: allow rename, no selsection / deletion
interface BatchedHistoryTableProps {
  batchedtestResults: TestHistoryBatch[];
  onNameUpdate?: (batchId: string, newName: string) => void;
//   selectedRowKeys: React.Key[];
//   onSelectChange: (newSelectedRowKeys: React.Key[]) => void;
//   onScoreUpdate?: (taskId: string, score: number) => void;
//   onDeleteSelected?: (taskIds?: string[]) => Promise<void>;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
    showTotal?: (total: number, range: [number, number]) => string;
    pageSizeOptions?: string[];
    hideOnSinglePage?: boolean;
    onShowSizeChange?: (current: number, size: number) => void;
  };
  onTableChange?: (...args: unknown[]) => void;
}

// ADD: define a history table layout
// with rename operations
const BatchedHistoryTable: React.FC<BatchedHistoryTableProps> = ({
  batchedtestResults,
  onNameUpdate,
//   selectedRowKeys,
//   onSelectChange,
//   onScoreUpdate,
//   onDeleteSelected,
  pagination,
  onTableChange,
}) => {
    // change batch name
    const [editingBatch, setEditingBatch] = useState<string | null>(null);
    const [editingName, setEditingName] = useState<string>('');

    const handleNameUpdate = (batch: TestHistoryBatch) => {
        setEditingBatch(batch._batchId);
        setEditingName(batch.batchName);
    };

    const handleNameSave = async (batchId: string) => {
        if (onNameUpdate) {
            await onNameUpdate(batchId, editingName);
        }
        setEditingBatch(null);
        setEditingName('');
    };

    const handleNameCancel = () => {
        setEditingBatch(null);
        setEditingName('');
    };

    // Jump to detailed result page
    const navigate = useNavigate();
    const handleViewBatch = (batchId: string) => {
        navigate(`/auto-test/history/${batchId}`);
    }

    // batch card template
    const BatchCard: React.FC<{ data: TestHistoryBatch; onNameUpdate?: (batchId: string, newName: string) => void }> = ({ data, onNameUpdate }) => {
    return (
        <div className="batch-card">
            <div className="batch-header">
                <div>
                    {editingBatch === data._batchId ? (
                        <div className="flex items-center gap-2">
                            <Input
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                onPressEnter={() => handleNameSave(data._batchId)}
                                autoFocus
                            />
                            <Button size="small" onClick={() => handleNameSave(data._batchId)}>
                                Save
                            </Button>
                            <Button size="small" onClick={handleNameCancel}>
                                Cancel
                            </Button>
                        </div>
                    ) : (
                        <h3 onClick={() => handleNameUpdate(data)} style={{ cursor: 'pointer' }}>
                            {data.batchName}
                        </h3>
                    )}
                    <span>{data.totalItems} Items</span>
                </div>

                <a className="view-prompt"
                onClick={() => {
                    Modal.info({
                        title: 'Batch Prompt',
                        content: (
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                                    {data.prompt}
                                </pre>
                            </div>
                        ),
                        width: 600,
                        okText: 'Close',
                    });
                }}>View Prompt →</a>

                <button className="view-results" onClick={() => handleViewBatch(data._batchId)}>View Results →</button>
            </div>

            <hr />

            <div className="batch-body">
                <span className="label">Prompt</span>
                <span className="prompt-text">{data.prompt}</span>
                <span className="provider">{data.provider}</span>
            </div>

            <div className="batch-footer">
                <span>⭐ Avg Rating: {data.averageRating}</span>
                <span>Avg Time: {data.averageTime}s</span>
            </div>
        </div>
    );
    };

    const columns = [
        {
            title: "",
            dataIndex: "batchId",
            key: "batchId",
            render: (record: TestHistoryBatch) => <BatchCard data={record} onNameUpdate={onNameUpdate} />,
        },
    ];

    return (
    <div className='bg-white rounded-lg shadow-md p-6'>
        <Table
        columns={columns}
        dataSource={batchedtestResults}
        pagination={pagination}
        rowKey='key'
        className='batched-test-results-table'
        onChange={onTableChange}
        />

    </div>
    );
};

// Batched History Page
const BatchedHistoryPage: React.FC = () => {
    const [batchedtestResults, setBatchedTestResults] = useState<TestHistoryBatch[]>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchTaskId, setSearchTaskId] = useState<string>('');
    const [searchModelId, setSearchModelId] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [timeRange, setTimeRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    null
    );
    const [isFiltered, setIsFiltered] = useState(false);
    const [isStatModalVisible, setIsStatModalVisible] = useState(false);
    const [averages, setAverages] = useState({
        avgTime: '0.00',
        minTime: '0.00',
        maxTime: '0.00',
        avgScore: '0.00',
        minScore: '0.00',
        maxScore: '0.00',
        successCount: 0,
        scoreCount: 0,
    });
    const navigate = useNavigate();
    const handleBack = () => {
        navigate('/auto-test/results');
    };

    // Fetch batched test results
    const fetchBatches = async () => {
        try {
            setLoading(true);
            const query: TestHistoryQuery = {
                // TODO: backend, return a batched data
                queryType: 'batch',
                page: currentPage,
                limit: pageSize,
            };

            if (isFiltered) {
                if (searchTaskId) query.taskId = searchTaskId;
                if (searchModelId) query.modelId = searchModelId;
                if (timeRange) {
                    query.startTime = timeRange[0].toISOString();
                    query.endTime = timeRange[1].toISOString();
                }
            }

            const response = await tryonApi.queryTestHistory(query);
            setBatchedTestResults(response.data || []);
            setTotal(response.total || 0);
        } catch (error) {
            console.error('Failed to fetch batches:', error);
            message.error('Failed to load batch history');
        } finally {
            setLoading(false);
        }
    };

    // Load data on mount and when filters change
    useEffect(() => {
        fetchBatches();
    }, [currentPage, pageSize, isFiltered]);

    // Handle batch name update
    const handleNameUpdate = async (batchId: string, newName: string) => {
        try {
            // TODO: Add API call to update batch name when backend supports it
            // await tryonApi.updateBatchName(batchId, newName);
            
            // Optimistically update the local state
            setBatchedTestResults(prev => 
                prev.map(batch => 
                    batch._batchId === batchId 
                        ? { ...batch, batchName: newName }
                        : batch
                )
            );
            message.success('Batch name updated successfully');
        } catch (error) {
            console.error('Failed to update batch name:', error);
            message.error('Failed to update batch name');
            // Refresh to get the correct data if update fails
            fetchBatches();
        }
    };

    // Calculate statistics
    const calculateAverages = () => {
        if (batchedtestResults.length === 0) {
            message.warning('No data available for statistics');
            return;
        }

        const avgTime = batchedtestResults.reduce((sum, batch) => sum + (batch.averageTime || 0), 0) / batchedtestResults.length;
        const avgRating = batchedtestResults.reduce((sum, batch) => sum + (batch.averageRating || 0), 0) / batchedtestResults.length;
        const totalItems = batchedtestResults.reduce((sum, batch) => sum + (batch.totalItems || 0), 0);
        const totalRated = batchedtestResults.reduce((sum, batch) => sum + (batch.ratedItems || 0), 0);

        setAverages({
            avgTime: avgTime.toFixed(2),
            minTime: Math.min(...batchedtestResults.map(b => b.averageTime || 0)).toFixed(2),
            maxTime: Math.max(...batchedtestResults.map(b => b.averageTime || 0)).toFixed(2),
            avgScore: avgRating.toFixed(2),
            minScore: Math.min(...batchedtestResults.map(b => b.averageRating || 0)).toFixed(2),
            maxScore: Math.max(...batchedtestResults.map(b => b.averageRating || 0)).toFixed(2),
            successCount: totalItems,
            scoreCount: totalRated,
        });
        setIsStatModalVisible(true);
    };
    
    // Page layout
    return (
    <div className='min-h-screen bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 py-6'>
        <div className='flex justify-between items-center mb-6'>
            <div className='flex items-center gap-4'>
            <Button
                icon={<ArrowLeftOutlined />}
                onClick={handleBack}
                className='!rounded-button'
            >
                Back
            </Button>
            <Title level={3} className='m-0'>
                Test History Records
            </Title>
            </div>
        </div>

        {/* Search */}
        {/* TODO: search batch function (later) */}
        <Card className='mb-6'>
            <div className='flex flex-col gap-4'>
            {/* First line: filter */}
            <div className='flex items-center gap-4'>
                <div className='flex items-center gap-2' style={{ flex: 1 }}>
                <Text className='font-semibold whitespace-nowrap'>
                    Task ID:
                </Text>
                <Input
                    placeholder='Please enter batchId'
                    value={searchTaskId}
                    onChange={(e) => setSearchTaskId(e.target.value)}
                    // onPressEnter={handleFilterSearch}
                    className='!rounded-button'
                />
                </div>
                <div className='flex items-center gap-2' style={{ flex: 1.5 }}>
                <Text className='font-semibold whitespace-nowrap'>
                    Model ID:
                </Text>
                <Input
                    placeholder='Please enter modelId'
                    value={searchModelId}
                    onChange={(e) => setSearchModelId(e.target.value)}
                    // onPressEnter={handleFilterSearch}
                    className='!rounded-button'
                />
                </div>
                <div className='flex items-center gap-2' style={{ flex: 1.5 }}>
                <Text className='font-semibold whitespace-nowrap'>
                    Time Range:
                </Text>
                <RangePicker
                    value={timeRange}
                    // onChange={handleTimeRangeChange}
                    showTime
                    format='YYYY-MM-DD HH:mm:ss'
                    placeholder={['Start Time', 'End Time']}
                    className='!rounded-button w-full'
                />
                </div>
            </div>

            {/* Second line: action buttons */}
            <div className='flex justify-end gap-2'>
                <Button
                type='primary'
                icon={<SearchOutlined />}
                onClick={handleFilterSearch}
                loading={searchLoading}
                className='!rounded-button'
                >
                Filter
                </Button>
                <Button
                icon={<BarChartOutlined />}
                onClick={calculateAverages}
                className='!rounded-button'
                >
                Statistics
                </Button>
                <Button
                icon={<ReloadOutlined />}
                onClick={handleResetSearch}
                className='!rounded-button'
                >
                Reset
                </Button>
            </div>
            </div>
            <div className='mt-4 text-sm text-gray-500'>
            Tip: You can enter TaskId, Model ID, and time range for combined filtering. Click Reset to restore all records
            </div>
        </Card>

        {/* update contents to be filled into batched history table */}
        <div className='flex gap-6'>
            <div className='flex-grow'>
            <BatchedHistoryTable
                batchedtestResults={batchedtestResults as TestHistoryBatch[]}
                onNameUpdate={handleNameUpdate}
                pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: total,
                onChange: (page, pageSize) => {
                    setCurrentPage(page);
                    setPageSize(pageSize);
                },
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                    `Items ${range[0]}-${range[1]} of ${total} total`,
                pageSizeOptions: ['10', '20', '50', '100'],
                hideOnSinglePage: false,
                onShowSizeChange: (current, size) => {
                    console.log('Page size changed:', { current, size });
                    setCurrentPage(current);
                    setPageSize(size);
                },
                }}
                onTableChange={(pagination: any) => {
                    if (pagination?.current) {
                        setCurrentPage(pagination.current);
                    }
                    if (pagination?.pageSize) {
                        setPageSize(pagination.pageSize);
                    }
                }}
            />
            {loading && (
                <div className='text-center py-4'>
                <span>Loading history records...</span>
                </div>
            )}
            </div>
        </div>
        </div>
        
        {/* update statistics contents */}
        <Modal
        title='Current List Data Statistics'
        open={isStatModalVisible}
        onCancel={() => setIsStatModalVisible(false)}
        footer={[
            <Button
            key='close'
            onClick={() => setIsStatModalVisible(false)}
            className='!rounded-button'
            >
            Close
            </Button>,
        ]}
        width={600}
        >
        <Descriptions bordered column={2} className='mt-6 mb-4'>
            <Descriptions.Item label='Average Execution Time' span={2}>
            <span className='text-blue-600 font-bold'>{averages.avgTime}</span>{' '}
            seconds
            </Descriptions.Item>
            <Descriptions.Item label='Min Execution Time'>
            <span className='text-blue-600 font-bold'>{averages.minTime}</span>{' '}
            seconds
            </Descriptions.Item>
            <Descriptions.Item label='Max Execution Time'>
            <span className='text-blue-600 font-bold'>{averages.maxTime}</span>{' '}
            seconds
            </Descriptions.Item>

            <Descriptions.Item label='Average Score' span={2}>
            <span className='text-green-600 font-bold'>
                {averages.avgScore}
            </span>
            </Descriptions.Item>
            <Descriptions.Item label='Min Score'>
            <span className='text-green-600 font-bold'>
                {averages.minScore}
            </span>
            </Descriptions.Item>
            <Descriptions.Item label='Max Score'>
            <span className='text-green-600 font-bold'>
                {averages.maxScore}
            </span>
            </Descriptions.Item>
        </Descriptions>
        <p className='text-sm text-gray-500'>
            * Execution time statistics based on {averages.successCount} successful records.
        </p>
        <p className='text-sm text-gray-500'>
            * Score statistics based on {averages.scoreCount} valid scored records (score &gt; 0).
        </p>
        </Modal>
    </div>
    );
};


export default BatchedHistoryPage;