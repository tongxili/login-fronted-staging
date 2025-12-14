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
import {HistoryPage} from './History';
import { tryonApi, TestHistoryItem, TestHistoryQuery } from '../../api/tryon';
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

// TODO: update table props for batched history
interface BatchedHistoryTableProps {
  testResults: TestResult[];
  selectedRowKeys: React.Key[];
  onSelectChange: (newSelectedRowKeys: React.Key[]) => void;
  onScoreUpdate?: (taskId: string, score: number) => void;
  onDeleteSelected?: (taskIds?: string[]) => Promise<void>;
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

// TODO: define a history table layout
// with operations(select, rename, delete(?), etc.)
const BatchedHistoryTable: React.FC<BatchedHistoryTableProps> = ({
  testResults,
  selectedRowKeys,
  onSelectChange,
  onScoreUpdate,
  onDeleteSelected,
  pagination,
  onTableChange,
}) => {};

// Batched History Page
const BatchedHistoryPage: React.FC = () => {
    const [TestResult, setBatchedTestResults] = useState<TestResult[]>([]);
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
    const navigate = useNavigate();
    const handleBack = () => {
        navigate('/auto-test/results');
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
        {/* TODO: search batch function */}
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
                    onPressEnter={handleFilterSearch}
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
                    onPressEnter={handleFilterSearch}
                    className='!rounded-button'
                />
                </div>
                <div className='flex items-center gap-2' style={{ flex: 1.5 }}>
                <Text className='font-semibold whitespace-nowrap'>
                    Time Range:
                </Text>
                <RangePicker
                    value={timeRange}
                    onChange={handleTimeRangeChange}
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

        {/* TODO: update contents to be filled into batched history table */}
        <div className='flex gap-6'>
            <div className='flex-grow'>
            <BatchedHistoryTable
                testResults={testResults}
                selectedRowKeys={selectedRowKeys}
                onSelectChange={setSelectedRowKeys}
                onScoreUpdate={handleScoreUpdate}
                onDeleteSelected={handleDeleteSelected}
                pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: total,
                onChange: handlePageChange,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                    `Items ${range[0]}-${range[1]} of ${total} total`,
                pageSizeOptions: ['10', '20', '50', '100'],
                hideOnSinglePage: false,
                onShowSizeChange: (current, size) => {
                    console.log('Page size changed:', { current, size });
                },
                }}
                onTableChange={handleTableChange}
            />
            {loading && (
                <div className='text-center py-4'>
                <span>Loading history records...</span>
                </div>
            )}
            </div>
        </div>
        </div>
        
        {/* TODO: update statistics contents */}
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