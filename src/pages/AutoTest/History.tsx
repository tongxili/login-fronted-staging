/**
 * Batch History Records Page
 * This component displays a table of batch history records
 * Options same as previous Test History Page
 * Return to BatchedHistoryPage when the back button is clicked
 */

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

// 自定义样式
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

// 注入样式
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = customModalStyles;
  document.head.appendChild(styleElement);
}

// 五星评分组件
const StarRating: React.FC<{
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled = false }) => {
  const [hoverValue, setHoverValue] = useState<number>(0);

  const handleStarClick = (starValue: number) => {
    if (!disabled) {
      onChange(starValue);
    }
  };

  const handleStarHover = (starValue: number) => {
    if (!disabled) {
      setHoverValue(starValue);
    }
  };

  const handleMouseLeave = () => {
    if (!disabled) {
      setHoverValue(0);
    }
  };

  const displayValue = hoverValue || value;

  return (
    <div
      className="flex items-center gap-1"
      onMouseLeave={handleMouseLeave}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`cursor-pointer transition-colors duration-200 ${disabled ? 'cursor-not-allowed' : ''
            }`}
          onClick={() => handleStarClick(star)}
          onMouseEnter={() => handleStarHover(star)}
        >
          {displayValue >= star ? (
            <StarFilled className="text-yellow-400 text-lg" />
          ) : (
            <StarOutlined className="text-gray-300 text-lg hover:text-yellow-400" />
          )}
        </span>
      ))}
    </div>
  );
};
import {
  ArrowLeftOutlined,
  SearchOutlined,
  ReloadOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { tryonApi, TestHistoryItem, TestHistoryQuery } from '../../api/tryon';
import { TestResult } from './Results';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// 自定义预览组件
const CustomImagePreview: React.FC<{
  userImage: string;
  clothingImage: string;
  generatedResult?: string;
  status?: string;
}> = ({ userImage, clothingImage, generatedResult, status }) => {
  return (
    <div className='flex gap-4 justify-center items-center p-4 bg-black'>
      <div className='text-center'>
        <div className='text-white text-sm mb-2'>INPUT 1 (USER IMAGE)</div>
        <img
          src={userImage}
          alt='User'
          className='max-w-md max-h-[1800px] object-contain'
        />
      </div>
      <div className='text-center'>
        <div className='text-white text-sm mb-2'>INPUT 2 (CLOTHING)</div>
        <img
          src={clothingImage}
          alt='Clothing'
          className='max-w-md max-h-[1800px] object-contain'
        />
      </div>
      <div className='text-center'>
        <div className='text-white text-sm mb-2'>GENERATED RESULT</div>
        {status === 'success' && generatedResult ? (
          <img
            src={generatedResult}
            alt='Generated Result'
            className='max-w-md max-h-[1800px] object-contain'
          />
        ) : status === 'FAILED' ? (
          <div className='max-w-md max-h-[1800px] flex items-center justify-center bg-gray-800 text-red-400'>
            Failed
          </div>
        ) : status === 'CANCELLED' ? (
          <div className='max-w-md max-h-[1800px] flex items-center justify-center bg-gray-800 text-orange-400'>
            Cancelled
          </div>
        ) : (
          <div className='max-w-md max-h-[1800px] flex items-center justify-center bg-gray-800 text-gray-400'>
            Waiting
          </div>
        )}
      </div>
    </div>
  );
};

interface HistoryTableProps {
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

const HistoryTable: React.FC<HistoryTableProps> = ({
  testResults,
  selectedRowKeys,
  onSelectChange,
  onScoreUpdate,
  onDeleteSelected,
  pagination,
  onTableChange,
}) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewData, setPreviewData] = useState<TestResult | null>(null);

  const handlePreview = (record: TestResult) => {
    setPreviewData(record);
    setPreviewVisible(true);
  };



  const handleDeleteButtonClick = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select items to delete');
      return;
    }

    // 获取选中项
    const selectedItems = testResults.filter((item) =>
      selectedRowKeys.includes(item.key)
    );

    Modal.confirm({
      title: 'Confirm Delete',
      content: `Are you sure you want to delete the selected ${selectedItems.length} test results? This action cannot be undone.`,
      okText: 'Confirm Delete',
      cancelText: 'Cancel',
      okType: 'danger',
      onOk: async () => {
        if (onDeleteSelected) {
          try {
            // 传递选中的 key 数组
            const selectedKeys = selectedItems.map((item) => item.key);
            await onDeleteSelected(selectedKeys);
            // 成功消息在 onDeleteSelected 中处理
          } catch (error) {
            console.error('Delete failed:', error);
            message.error('Delete failed');
          }
        }
      },
    });
  };

  const columns: ColumnsType<TestResult> = [
    {
      title: 'INPUT 1 (USER IMAGE)',
      dataIndex: 'userImage',
      key: 'userImage',
      width: 150,
      render: (image, record: TestResult) => (
        <div
          className='w-28 h-36 overflow-hidden cursor-pointer'
          onClick={() => handlePreview(record)}
        >
          <img
            src={image}
            alt='User'
            className='w-full h-full object-cover object-top'
          />
          <div className='absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center'>
            <span className='text-white text-xs opacity-0 hover:opacity-100 transition-opacity duration-200'>
              Click to preview all
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'INPUT 2 (CLOTHING)',
      dataIndex: 'clothingImage',
      key: 'clothingImage',
      width: 150,
      render: (image, record: TestResult) => (
        <div
          className='w-28 h-36 overflow-hidden cursor-pointer'
          onClick={() => handlePreview(record)}
        >
          <img
            src={image}
            alt='Clothing'
            className='w-full h-full object-cover object-top'
          />
          <div className='absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center'>
            <span className='text-white text-xs opacity-0 hover:opacity-100 transition-opacity duration-200'>
              Click to preview all
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'GENERATED RESULT',
      dataIndex: 'generatedResult',
      key: 'generatedResult',
      width: 150,
      render: (image, record: TestResult) => (
        <div
          className='w-28 h-36 overflow-hidden relative cursor-pointer'
          onClick={() => handlePreview(record)}
        >
          {record.status === 'success' && image ? (
            <img
              src={image}
              alt='Generated Result'
              className='w-full h-full object-cover object-top'
            />
          ) : record.status === 'FAILED' ? (
            <div className='w-full h-full bg-red-100 flex items-center justify-center'>
              <Text type='danger'>Failed</Text>
            </div>
          ) : (
            <div className='w-full h-full bg-gray-100 flex items-center justify-center'>
              <Text type='secondary'>Waiting</Text>
            </div>
          )}
          <div className='absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center'>
            <span className='text-white text-xs opacity-0 hover:opacity-100 transition-opacity duration-200'>
              Click to preview all
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'Execution Time',
      dataIndex: 'executionTime',
      key: 'executionTime',
      width: 120,
      className: 'whitespace-nowrap',
      sorter: (a, b) => {
        // 处理 undefined 和 null 值
        const timeA = a.executionTime || 0;
        const timeB = b.executionTime || 0;
        return timeA - timeB;
      },
      render: (time, record) => {
        if (record.status === 'success' && time) {
          return `${(time / 1000).toFixed(2)}s`;
        } else if (record.status === 'FAILED') {
          return <span className='text-red-500'>Failed</span>;
        } else if (record.status === 'IN_PROGRESS') {
          return <span className='text-blue-500'>Processing</span>;
        }
        return '-';
      },
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      width: 150,
      sorter: (a, b) => {
        // 处理 undefined 和 null 值
        const scoreA = a.score || 0;
        const scoreB = b.score || 0;
        return scoreA - scoreB;
      },
      render: (score, record: TestResult) => {
        if (record.status !== 'success') {
          return <span className='text-gray-400'>-</span>;
        }

        const handleScoreChange = async (newScore: number) => {
          if (onScoreUpdate && record.taskId) {
            try {
              await onScoreUpdate(record.taskId, newScore);
              message.success(`Score updated to ${newScore}`);
            } catch (error) {
              console.error('Score update failed:', error);
              message.error('Score update failed');
            }
          }
        };

        return (
          <div className="flex items-center gap-2">
            <StarRating
              value={score || 0}
              onChange={handleScoreChange}
              disabled={false}
            />
            {score && <span className="text-sm text-gray-500">({score})</span>}
          </div>
        );
      },
    },
    {
      title: 'TASK ID',
      dataIndex: 'taskId',
      key: 'taskId',
      width: 200,
      className: 'whitespace-nowrap',
    },
    {
      title: 'MODEL ID',
      dataIndex: 'modelId',
      key: 'modelId',
      width: 150,
      className: 'whitespace-nowrap',
      render: (modelId, record: TestResult) => {
        if (record.status !== 'success') {
          return <span className='text-gray-400'>-</span>;
        }
        return <span className='font-mono text-sm'>{modelId || '-'}</span>;
      },
    },
    {
      title: 'Saved Time',
      dataIndex: 'savedAt',
      key: 'savedAt',
      width: 180,
      className: 'whitespace-nowrap',
      sorter: (a, b) => {
        const timeA = a.savedAt ? new Date(a.savedAt).getTime() : 0;
        const timeB = b.savedAt ? new Date(b.savedAt).getTime() : 0;
        return timeA - timeB;
      },
      render: (savedAt) => {
        if (!savedAt) {
          return <span className='text-gray-400'>-</span>;
        }

        try {
          const date = new Date(savedAt);
          return (
            <div className='text-sm'>
              <div>{date.toLocaleDateString('zh-CN')}</div>
              <div className='text-gray-500'>
                {date.toLocaleTimeString('zh-CN')}
              </div>
            </div>
          );
        } catch {
          return <span className='text-gray-400'>Format Error</span>;
        }
      },
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  return (
    <div className='bg-white rounded-lg shadow-md p-6'>
      <div className='flex justify-between items-center mb-4'>
        <Checkbox
          onChange={(e) =>
            e.target.checked
              ? onSelectChange(testResults.map((item) => item.key))
              : onSelectChange([])
          }
        >
          Select All
        </Checkbox>
        {selectedRowKeys.length > 0 && (
          <Button
            type='primary'
            danger
            onClick={handleDeleteButtonClick}
            className='!rounded-button whitespace-nowrap'
          >
            Delete Selected ({selectedRowKeys.length})
          </Button>
        )}
      </div>
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={testResults}
        pagination={pagination}
        rowKey='key'
        className='test-results-table'
        onChange={onTableChange}
      />

      {/* 自定义预览模态框 */}
      <Modal
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={2000}
        centered
        destroyOnClose
        className="custom-preview-modal"
      >
        {previewData && (
          <CustomImagePreview
            userImage={previewData.userImage}
            clothingImage={previewData.clothingImage}
            generatedResult={previewData.generatedResult}
            status={previewData.status}
          />
        )}
      </Modal>
    </div>
  );
};

const HistoryPage: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
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
    avgTime: 0,
    minTime: 0,
    maxTime: 0,
    avgScore: 0,
    minScore: 0,
    maxScore: 0,
    scoreCount: 0,
    successCount: 0,
  });
  const navigate = useNavigate();
  const isRequesting = useRef(false);

  const calculateAverages = () => {
    if (testResults.length === 0) {
      setAverages({
        avgTime: 0,
        minTime: 0,
        maxTime: 0,
        avgScore: 0,
        minScore: 0,
        maxScore: 0,
        scoreCount: 0,
        successCount: 0,
      });
      setIsStatModalVisible(true); // 即使没数据也打开弹窗显示0
      return;
    }

    // --- 耗时统计 ---
    const successfulResults = testResults.filter(
      (r) => r.status === 'success' && r.executionTime && r.executionTime > 0
    );
    const successCount = successfulResults.length;
    let avgTime = 0,
      minTime = 0,
      maxTime = 0;

    if (successCount > 0) {
      const executionTimes = successfulResults.map((r) => r.executionTime!);
      const totalExecutionTime = executionTimes.reduce(
        (sum, time) => sum + time,
        0
      );
      avgTime = totalExecutionTime / successCount;
      minTime = Math.min(...executionTimes);
      maxTime = Math.max(...executionTimes);
    }

    // --- 得分统计 ---
    const scoredResults = testResults.filter(
      (result) =>
        result.score !== undefined && result.score !== null && result.score > 0
    );
    const scoreCount = scoredResults.length;
    let avgScore = 0,
      minScore = 0,
      maxScore = 0;

    if (scoreCount > 0) {
      const scores = scoredResults.map((r) => r.score!);
      const totalScore = scores.reduce((sum, score) => sum + score, 0);
      avgScore = totalScore / scoreCount;
      minScore = Math.min(...scores);
      maxScore = Math.max(...scores);
    }

    setAverages({
      avgTime: parseFloat((avgTime / 1000).toFixed(2)),
      minTime: parseFloat((minTime / 1000).toFixed(2)),
      maxTime: parseFloat((maxTime / 1000).toFixed(2)),
      avgScore: parseFloat(avgScore.toFixed(2)),
      minScore,
      maxScore,
      scoreCount,
      successCount,
    });
    setIsStatModalVisible(true);
  };

  useEffect(() => {
    fetchTestHistory(1, 10);
  }, []);

  const fetchTestHistory = async (page?: number, limit?: number) => {
    if (isRequesting.current) {
      return;
    }
    isRequesting.current = true;
    setLoading(true);

    try {
      const response = await tryonApi.queryTestHistory({
        queryType: 'all',
        page: page || currentPage,
        limit: limit || pageSize,
      });

      const formattedResults = response.data.map(
        (result: TestHistoryItem, index: number) => ({
          key: result._id || index.toString(),
          userImage: result.userImage,
          clothingImage: result.clothingImage,
          generatedResult: result.generatedResult,
          taskId: result.taskId,
          status: result.status,
          executionTime: result.executionTime,
          error: result.error || undefined,
          score: result.score,
          savedAt: result.savedAt,
          modelId: result.modelId,
        })
      );

      setTestResults(formattedResults);
      if (response.pagination) {
        const correctTotal =
          response.pagination.totalPages * response.pagination.limit;
        setTotal(correctTotal);
        setCurrentPage(response.pagination.page);
        setPageSize(response.pagination.limit);
      }
    } catch (error) {
      const e = error as Error;
      console.error('获取测试历史记录失败:', e);
      message.error(`获取测试历史记录失败: ${e.message}`);
    } finally {
      setLoading(false);
      isRequesting.current = false;
    }
  };

  const handleFilterSearch = async () => {
    const hasTaskId = searchTaskId.trim() !== '';
    const hasModelId = searchModelId.trim() !== '';
    const hasTimeRange = timeRange && timeRange[0] && timeRange[1];

    if (!hasTaskId && !hasModelId && !hasTimeRange) {
      message.warning('Please enter at least one filter condition (TaskId, Model ID, or time range)');
      return;
    }

    setSearchLoading(true);
    try {
      const query: TestHistoryQuery = {
        queryType: 'byFilter',
        page: 1, // 每次筛选都回到第一页
        limit: pageSize,
      };

      if (hasTaskId) {
        query.taskId = searchTaskId.trim();
      }
      if (hasModelId) {
        query.modelId = searchModelId.trim();
      }
      if (hasTimeRange) {
        query.startTime = timeRange![0].toISOString();
        query.endTime = timeRange![1].toISOString();
      }

      const response = await tryonApi.queryTestHistory(query);

      const formattedResults = response.data.map(
        (result: TestHistoryItem, index: number) => ({
          key: result._id || index.toString(),
          userImage: result.userImage,
          clothingImage: result.clothingImage,
          generatedResult: result.generatedResult,
          taskId: result.taskId,
          status: result.status,
          executionTime: result.executionTime,
          error: result.error || undefined,
          score: result.score,
          savedAt: result.savedAt,
          modelId: result.modelId,
        })
      );

      setTestResults(formattedResults);
      if (response.pagination) {
        const correctTotal =
          response.pagination.totalPages * response.pagination.limit;
        setTotal(correctTotal);
        setCurrentPage(response.pagination.page);
        setPageSize(response.pagination.limit);
      } else {
        setTotal(formattedResults.length);
        setCurrentPage(1);
      }
      setIsFiltered(true);
      message.success(
        `Found ${response.pagination?.total || formattedResults.length} records`
      );
    } catch (error) {
      const e = error as Error;
      console.error('Filter failed:', e);
      message.error(`Filter failed: ${e.message}`);
    } finally {
      setSearchLoading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleTimeRangeChange = (dates: any) => {
    setTimeRange(dates);
  };

  const handleResetSearch = () => {
    setSearchTaskId('');
    setSearchModelId('');
    setTimeRange(null);
    setIsFiltered(false);
    fetchTestHistory(1, 10);
  };

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);

    if (isFiltered) {
      // 在筛选模式下，分页需要保留筛选条件
      const hasTaskId = searchTaskId.trim() !== '';
      const hasModelId = searchModelId.trim() !== '';
      const hasTimeRange = timeRange && timeRange[0] && timeRange[1];

      const query: TestHistoryQuery = {
        queryType: 'byFilter',
        page,
        limit: size,
      };
      if (hasTaskId) query.taskId = searchTaskId.trim();
      if (hasModelId) query.modelId = searchModelId.trim();
      if (hasTimeRange) {
        query.startTime = timeRange![0].toISOString();
        query.endTime = timeRange![1].toISOString();
      }

      setSearchLoading(true);
      tryonApi
        .queryTestHistory(query)
        .then((response) => {
          const formattedResults = response.data.map(
            (result: TestHistoryItem, index: number) => ({
              key: result._id || index.toString(),
              userImage: result.userImage,
              clothingImage: result.clothingImage,
              generatedResult: result.generatedResult,
              taskId: result.taskId,
              status: result.status,
              executionTime: result.executionTime,
              error: result.error || undefined,
              score: result.score,
              savedAt: result.savedAt,
              modelId: result.modelId,
            })
          );
          setTestResults(formattedResults);
          if (response.pagination) {
            const correctTotal =
              response.pagination.totalPages * response.pagination.limit;
            setTotal(correctTotal);
            setCurrentPage(response.pagination.page);
            setPageSize(response.pagination.limit);
          }
        })
        .catch((error) => {
          const e = error as Error;
          console.error('Filter pagination failed:', e);
          message.error(`Failed to get data: ${e.message}`);
        })
        .finally(() => {
          setSearchLoading(false);
        });
    } else {
      fetchTestHistory(page, size);
    }
  };

  const handleTableChange = (...args: unknown[]) => {
    // 处理排序变化
    const sorter = args[2] as {
      field?: string;
      order?: 'ascend' | 'descend' | null;
    };

    if (sorter && sorter.field) {
      // 排序时重新请求接口，传递排序参数
      // 这里可以根据需要添加排序参数到 API 调用中
      if (isFiltered) {
        handleFilterSearch();
      } else {
        fetchTestHistory(currentPage, pageSize);
      }
    }
  };

  const handleScoreUpdate = async (taskId: string, score: number) => {
    try {
      const updatedResult = await tryonApi.updateScore(taskId, score);

      // 打分后重新请求当前页的数据
      fetchTestHistory(currentPage, pageSize);

      return updatedResult;
    } catch (error) {
      const e = error as Error;
      console.error('Score update failed:', e);
      message.error(`Score update failed: ${e.message}`);
      throw error;
    }
  };

  const handleDeleteSelected = async (keys?: string[]) => {
    try {
      // 在 History 页面，需要通过 taskId 调用后端 API
      // 获取选中项的 taskId
      const selectedTaskIds = testResults
        .filter(
          (item) =>
            keys?.includes(item.key) || selectedRowKeys.includes(item.key)
        )
        .map((item) => item.taskId)
        .filter(Boolean) as string[];

      if (selectedTaskIds.length === 0) {
        message.warning('Selected items do not have valid taskId');
        return;
      }

      const result = await tryonApi.deleteTestResults(selectedTaskIds);

      // 删除后重新请求当前页的数据
      fetchTestHistory(currentPage, pageSize);

      // 清空选中状态
      setSelectedRowKeys([]);

      message.success(`Successfully deleted ${result.deletedCount} test results`);
    } catch (error) {
      const e = error as Error;
      console.error('Failed to delete test results:', e);
      message.error(`Failed to delete test results: ${e.message}`);
      throw error;
    }
  };

  const handleBack = () => {
    navigate('/auto-test/history');
  };

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
              Batch History Records
            </Title>
          </div>
        </div>

        {/* 检索区域 */}
        <Card className='mb-6'>
          <div className='flex flex-col gap-4'>
            {/* 第一行：筛选条件 */}
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-2' style={{ flex: 1 }}>
                <Text className='font-semibold whitespace-nowrap'>
                  Task ID:
                </Text>
                <Input
                  placeholder='Please enter taskId'
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

            {/* 第二行：操作按钮 */}
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

        <div className='flex gap-6'>
          <div className='flex-grow'>
            <HistoryTable
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

export default HistoryPage;
